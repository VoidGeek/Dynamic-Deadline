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

// Create a task with assigned due date and priority
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
        [process.env.PRIORITY_CUSTOM_FIELD_ID!]: priorityGidMap[priority],
      },
    },
  });

  logMessage(
    "INFO",
    `Task "${name}" created successfully with priority "${priority}" and due date "${dueDate}".`
  );
  sendResponse(res, 201, "Task created successfully.", response.data.data);
};

// Move a task to the "In Progress" section
export const moveTaskToInProgress = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;

  // Step 1: Fetch the task details
  logMessage("DEBUG", `Fetching task with ID: ${id}`);
  const { data: task } = (
    await asanaClient.get<{ data: Task }>(`/tasks/${id}`, {
      params: { opt_fields: "gid,name,due_on,custom_fields" }, // Include custom_fields for priority
    })
  ).data;

  if (!task) {
    throw new AppError(404, "Task not found.");
  }

  // Extract priority from custom fields
  const priorityFieldId = process.env.PRIORITY_CUSTOM_FIELD_ID!;
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

    // Update the due dates of other tasks in progress
    await Promise.all(
      inProgressTasks
        .filter((t) => t.gid !== id) // Exclude the current task
        .map((t) => {
          const extendedDate = new Date(t.due_on || new Date());
          extendedDate.setDate(extendedDate.getDate() + 2); // Extend due date by 2 days
          const newDueDate = extendedDate.toISOString().split("T")[0];

          logMessage(
            "INFO",
            `Extending due date for task: "${t.name}" (ID: ${t.gid}), Old Due Date: ${t.due_on}, New Due Date: ${newDueDate}`
          );

          return updateTaskDueDate(t.gid, newDueDate);
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
