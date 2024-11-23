import { Request, Response } from "express";
import { asanaClient } from "../services/asanaClient";
import { calculateDueDate } from "../utils/calculateDueDate";
import {
  fetchInProgressTasks,
  updateTaskDueDate,
} from "../services/taskService";
import { Task, CreateTaskRequest, CustomField } from "../interfaces/task"; // Import interfaces
import { logMessage } from "../utils/logger"; // Logging utility
import { AppError } from "../middlewares/errorHandler";

const priorityGidMap: Record<string, string> = {
  Low: process.env.PRIORITY_LOW_ID!,
  Medium: process.env.PRIORITY_MEDIUM_ID!,
  High: process.env.PRIORITY_HIGH_ID!,
};

export const createTask = async (
  req: Request<any, any, CreateTaskRequest>,
  res: Response
) => {
  const { name, priority, projects } = req.body;

  if (!name || !priority) {
    throw new AppError(400, "Name and priority are required.");
  }

  const projectIds = Array.isArray(projects)
    ? projects
    : [process.env.DEFAULT_PROJECT_ID!];

  if (!priorityGidMap[priority]) {
    throw new AppError(
      400,
      "Invalid priority. Allowed values: 'Low', 'Medium', 'High'."
    );
  }

  const dueDate = calculateDueDate(priority);

  const response = await asanaClient.post("/tasks", {
    data: {
      name,
      projects: projectIds,
      due_on: dueDate,
      custom_fields: {
        [process.env.PRIORITY_CUSTOM_FIELD_ID!]: priorityGidMap[priority], // Set priority
        [process.env.EXTENSION_PROCESSED_FIELD_ID!]: "1208809657512866", // Set "false" for Extension Processed
      },
    },
  });

  logMessage(
    "INFO",
    `Task "${name}" created successfully with priority "${priority}", due date "${dueDate}", and Extension Processed set to "false".`
  );
  sendResponse(res, 201, "Task created successfully.", response.data.data);
};


export const moveTaskToInProgress = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;

  // Step 1: Fetch the task details
  logMessage("DEBUG", `Fetching task with ID: ${id}`);
  const { data: task } = (
    await asanaClient.get<{ data: Task }>(`/tasks/${id}`, {
      params: { opt_fields: "gid,name,due_on,custom_fields" },
    })
  ).data;

  if (!task) {
    throw new AppError(404, "Task not found.");
  }

  // Extract priority and extension_processed status from custom fields
  const priorityFieldId = process.env.PRIORITY_CUSTOM_FIELD_ID!;
  const extensionFieldId = process.env.EXTENSION_PROCESSED_FIELD_ID!;

  const priority = task.custom_fields?.find(
    (field: CustomField) => field.gid === priorityFieldId
  )?.enum_value?.name;

  logMessage(
    "DEBUG",
    `Task fetched: Name: ${task.name}, ID: ${task.gid}, Priority: ${
      priority || "None"
    }, Due On: ${task.due_on}`
  );

  if (!priority) {
    throw new AppError(400, "Task priority is missing or undefined.");
  }

  // Step 2: Move the task to the "In Progress" section
  await asanaClient.post(
    `/sections/${process.env.IN_PROGRESS_SECTION_ID!}/addTask`,
    {
      data: { task: id },
    }
  );

  logMessage(
    "INFO",
    `Task "${task.name}" (ID: ${id}) moved to the "In Progress" section`
  );

  // Step 3: Handle high-priority tasks
  if (priority === "High") {
    logMessage("DEBUG", "Handling high-priority task adjustments");

    // Fetch all tasks currently in progress
    const inProgressTasks = await fetchInProgressTasks();
    logMessage(
      "DEBUG",
      `Fetched ${inProgressTasks.length} tasks currently in the "In Progress" section`
    );

    // Filter and update only eligible tasks
    const tasksToUpdate = inProgressTasks.filter((t) => {
      logMessage(
        "DEBUG",
        `Evaluating task "${t.name}" (ID: ${t.gid}) for updates.`
      );

      const priorityField = t.custom_fields?.find(
        (field: CustomField) =>
          field.gid === process.env.PRIORITY_CUSTOM_FIELD_ID
      );
      const extensionField = t.custom_fields?.find(
        (field: CustomField) =>
          field.gid === process.env.EXTENSION_PROCESSED_FIELD_ID
      );

      // Extract priority and extension processed values safely
      const tPriority = priorityField?.enum_value?.name || "None";
      const isExtensionProcessed =
        extensionField?.enum_value?.gid === "1208809657512865"; // Check if "true" enum GID is set

      logMessage(
        "DEBUG",
        `Task "${t.name}" - Priority: ${tPriority}, Extension Processed: ${
          isExtensionProcessed ? "true" : "false"
        }`
      );

      // Skip tasks with High priority or already processed
      if (tPriority === "High" || isExtensionProcessed) {
        logMessage(
          "INFO",
          `Skipping task "${t.name}" (ID: ${t.gid}) - ${
            tPriority === "High" ? "High priority" : "Already processed"
          }.`
        );
        return false;
      }

      return true;
    });

    logMessage(
      "INFO",
      `Found ${tasksToUpdate.length} tasks eligible for due date extension.`
    );

    // Update the due dates of eligible tasks
    await Promise.all(
      tasksToUpdate.map(async (t) => {
        const extendedDate = new Date(t.due_on || new Date());
        extendedDate.setDate(extendedDate.getDate() + 2); // Extend due date by 2 days
        const newDueDate = extendedDate.toISOString().split("T")[0];

        logMessage(
          "INFO",
          `Extending due date for task: "${t.name}" (ID: ${t.gid}), Old Due Date: ${t.due_on}, New Due Date: ${newDueDate}`
        );

        await updateTaskDueDate(t.gid, newDueDate);

        // Mark the task as "extension_processed"
        await asanaClient.put(`/tasks/${t.gid}`, {
          data: {
            custom_fields: {
              [extensionFieldId]: "1208809657512865", // Set to "true" using GID
            },
          },
        });

        logMessage(
          "INFO",
          `Marked task "${t.name}" (ID: ${t.gid}) as extension processed.`
        );
      })
    );
  }

  // Step 4: Send success response
  sendResponse(res, 200, "Task moved to In Progress successfully.");
};

// Fetch all tasks in "In Progress" section
export const getInProgressTasks = async (_req: Request, res: Response) => {
  logMessage("DEBUG", "Fetching all tasks in the 'In Progress' section");
  const tasks = await fetchInProgressTasks();
  logMessage("INFO", `Fetched ${tasks.length} tasks in progress.`);
  sendResponse(res, 200, "Fetched all tasks in progress.", tasks);
};

// Fetch tasks for a specific project
export const getTasksByProject = async (
  req: Request<{ projectId: string }>,
  res: Response
) => {
  const { projectId } = req.params;

  logMessage("DEBUG", `Fetching tasks for project ID: ${projectId}`);
  const { data: tasks } = (
    await asanaClient.get<{ data: Task[] }>("/tasks", {
      params: { project: projectId },
    })
  ).data;

  logMessage(
    "INFO",
    `Fetched ${tasks.length} tasks for project ID: ${projectId}.`
  );
  sendResponse(res, 200, "Fetched tasks for the project.", tasks);
};
