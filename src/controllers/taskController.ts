import { Request, Response } from "express";
import { asanaClient } from "../services/asanaClient";
import { calculateDueDate } from "../utils/calculateDueDate";
import {
  fetchInProgressTasks,
  updateTaskDueDate,
  filterTasksForUpdate,
  fixTask,
} from "../services/taskService";
import { Task, CreateTaskRequest, CustomField } from "../interfaces/task"; // Import interfaces

const VALID_PRIORITIES: CreateTaskRequest["priority"][] = [
  "Low",
  "Medium",
  "High",
];

const priorityGidMap: Record<string, string> = {
  Low: process.env.PRIORITY_LOW_ID!,
  Medium: process.env.PRIORITY_MEDIUM_ID!,
  High: process.env.PRIORITY_HIGH_ID!,
};

export const createTask = async (
  req: Request<any, any, Partial<CreateTaskRequest>>, // Accept Partial to allow missing fields
  res: Response
) => {
  const { name, projects, priority } = req.body; // No default for priority here

  if (!name) {
    throw new AppError(400, "Name is required.");
  }

  // Validate the priority
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    throw new AppError(
      400,
      `Invalid priority. Allowed values: ${VALID_PRIORITIES.join(", ")}.`
    );
  }

  // Ensure projects array exists or use the default project
  const projectIds = Array.isArray(projects)
    ? projects
    : [process.env.DEFAULT_PROJECT_ID!];

  // Calculate due date only if priority is provided
  const dueDate = priority ? calculateDueDate(priority) : undefined;

  // Map custom fields
  const customFields: Record<string, string> = {
    [process.env.EXTENSION_PROCESSED_FIELD_ID!]: priority
      ? process.env.FALSE_ENUM_GID! // Set "false" if priority is provided
      : process.env.TRUE_ENUM_GID!, // Set "true" if priority is not provided
  };

  // Add priority to custom fields if provided
  if (priority) {
    customFields[process.env.PRIORITY_CUSTOM_FIELD_ID!] =
      priorityGidMap[priority];
  }

  const memberships = projectIds.map((projectId) => ({
    project: projectId,
    section: process.env.DEFAULT_SECTION_ID!, // Use the default section ID from environment variables
  }));

  // Prepare the payload for the Asana API
  const data: Record<string, any> = {
    name,
    projects: projectIds,
    memberships,
    custom_fields: customFields,
    ...(dueDate && { due_on: dueDate }), // Include due date only if it exists
  };

  // Send the API request to create the task
  const response = await asanaClient.post("/tasks", { data });

  logMessage(
    "INFO",
    `Task "${name}" created successfully in projects "${projectIds.join(
      ", "
    )}"${
      dueDate ? ` with due date "${dueDate}"` : ""
    } and extension processed set to ${priority ? "false" : "true"}.`
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

    // Use the filterTasksForUpdate utility to determine eligible tasks
    const tasksToUpdate = filterTasksForUpdate(
      inProgressTasks,
      priorityFieldId,
      extensionFieldId
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
              [extensionFieldId]: process.env.TRUE_ENUM_GID, // Set to "true" using GID
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

export const fixTaskController = async (req: Request, res: Response) => {
  const { id: taskId } = req.params;

  logMessage("INFO", `Received request to fix task with ID: ${taskId}`);

  await fixTask(taskId); // Call the service function to fix the task

  logMessage("INFO", `Task ${taskId} fixed successfully.`);
  sendResponse(res, 200, `Task ${taskId} fixed successfully.`);
};

export const updateTaskPriorityAndDueDate = async (
  req: Request,
  res: Response
) => {
  const { id: taskId } = req.params;
  const { priority } = req.body; // Priority is passed in the request body

  if (!priority) {
    throw new AppError(400, "Priority is required.");
  }

  const VALID_PRIORITIES = ["Low", "Medium", "High"];
  const priorityGidMap: Record<string, string> = {
    Low: process.env.PRIORITY_LOW_ID!,
    Medium: process.env.PRIORITY_MEDIUM_ID!,
    High: process.env.PRIORITY_HIGH_ID!,
  };

  if (!VALID_PRIORITIES.includes(priority)) {
    throw new AppError(
      400,
      `Invalid priority value. Allowed values are: ${VALID_PRIORITIES.join(
        ", "
      )}.`
    );
  }

  logMessage("INFO", `Updating task ${taskId} with priority: ${priority}`);

  // Fetch the task details
  const { data: task } = await asanaClient.get(`/tasks/${taskId}`, {
    params: { opt_fields: "gid,name,custom_fields" },
  });

  if (!task) {
    throw new AppError(404, `Task with ID ${taskId} not found.`);
  }

  logMessage("DEBUG", `Fetched task details: ${JSON.stringify(task)}`);

  const customFields: Record<string, string> = {};
  let needsUpdate = false;

  // Update the priority
  const priorityFieldId = process.env.PRIORITY_CUSTOM_FIELD_ID!;
  customFields[priorityFieldId] = priorityGidMap[priority];
  logMessage("INFO", `Setting priority of task ${taskId} to: ${priority}`);
  needsUpdate = true;

  // Calculate and update due date
  const defaultDueDate = calculateDueDate(priority);
  logMessage(
    "INFO",
    `Setting due date for task ${taskId} to: ${defaultDueDate}`
  );

  // Update the `extension_processed` field to `False`
  const extensionFieldId = process.env.EXTENSION_PROCESSED_FIELD_ID!;
  customFields[extensionFieldId] = process.env.FALSE_ENUM_GID!;
  logMessage("INFO", `Setting extension_processed of task ${taskId} to: False`);

  const updatedTaskData = {
    due_on: defaultDueDate,
    custom_fields: customFields,
  };

  await asanaClient.put(`/tasks/${taskId}`, {
    data: updatedTaskData,
  });

  logMessage(
    "INFO",
    `Task ${taskId} successfully updated with priority: ${priority}, due date: ${defaultDueDate}, and extension_processed set to: False.`
  );

  sendResponse(res, 200, `Task ${taskId} updated successfully.`);
};

export const updateHighPriorityTaskOnRemoval = async (
  req: Request,
  res: Response
) => {
  logMessage("INFO", "Processing all tasks in 'In Progress' section");

  const extensionProcessedFieldId = process.env.EXTENSION_PROCESSED_FIELD_ID!;
  const trueEnumGid = process.env.TRUE_ENUM_GID!;
  const falseEnumGid = process.env.FALSE_ENUM_GID!;

  // Step 1: Fetch tasks in the "In Progress" section using the service
  const tasks = await fetchInProgressTasks();

  if (!tasks || tasks.length === 0) {
    logMessage("INFO", "No tasks found in 'In Progress' section.");
    return sendResponse(res, 200, "No tasks to process in 'In Progress'.");
  }

  logMessage("INFO", `Fetched ${tasks.length} tasks in 'In Progress'.`);

  // Step 2: Filter tasks where `extension_processed` is `true`
  const tasksToProcess = tasks.filter((task: any) => {
    const extensionProcessed = task.custom_fields?.find(
      (field: any) => field.gid === extensionProcessedFieldId
    )?.enum_value?.gid;

    return extensionProcessed === trueEnumGid;
  });

  logMessage(
    "INFO",
    `${tasksToProcess.length} tasks with extension_processed = true will be updated.`
  );

  // Step 3: Update each eligible task
  await Promise.all(
    tasksToProcess.map(async (task: any) => {
      const oldDueDate = new Date(task.due_on);
      const newDueDate = new Date(oldDueDate);
      newDueDate.setDate(oldDueDate.getDate() - 2); // Subtract 2 days

      logMessage(
        "INFO",
        `Updating task: ${task.name} (ID: ${
          task.gid
        }) | Old Due Date: ${oldDueDate.toISOString()} | New Due Date: ${newDueDate.toISOString()}`
      );

      // Update the task in Asana
      await asanaClient.put(`/tasks/${task.gid}`, {
        data: {
          due_on: newDueDate.toISOString().split("T")[0],
          custom_fields: {
            [extensionProcessedFieldId]: falseEnumGid, // Set extension_processed to false
          },
        },
      });

      logMessage(
        "INFO",
        `Task ${task.name} (ID: ${
          task.gid
        }) updated: Due Date: ${newDueDate.toISOString()}, Extension Processed: false`
      );
    })
  );

  sendResponse(
    res,
    200,
    `${tasksToProcess.length} tasks updated successfully in 'In Progress'.`
  );
};
