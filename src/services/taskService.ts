import { asanaClient } from "./asanaClient";
import { CustomField, Task } from "../interfaces/task";
const VALID_PRIORITIES = ["Low", "Medium", "High"];
const priorityGidMap: Record<string, string> = {
  Low: process.env.PRIORITY_LOW_ID!,
  Medium: process.env.PRIORITY_MEDIUM_ID!,
  High: process.env.PRIORITY_HIGH_ID!,
};

import { calculateDueDate } from "../utils/calculateDueDate";
// Fetch tasks in "In Progress" section
export const fetchInProgressTasks = async (): Promise<Task[]> => {
  const response = await asanaClient.get(
    `/sections/${process.env.IN_PROGRESS_SECTION_ID}/tasks`,
    {
      params: {
        opt_fields: "gid,name,due_on,custom_fields", // Include custom_fields to fetch Priority and Extension Processed
      },
    }
  );
  return response.data.data as Task[];
};

// Update a task's due date
export const updateTaskDueDate = async (taskId: string, newDueDate: string) => {
  await asanaClient.put(`/tasks/${taskId}`, {
    data: { due_on: newDueDate }, // Wrap the due_on field inside a data object
  });
  logMessage("INFO", `Updated task ${taskId} due date to: ${newDueDate}`);
};

/**
 * Filters tasks for updates based on Priority and Extension Processed fields.
 * @param tasks - Array of tasks to evaluate.
 * @param priorityFieldId - GID for the Priority field.
 * @param extensionFieldId - GID for the Extension Processed field.
 * @returns Array of tasks eligible for updates.
 */
export const filterTasksForUpdate = (
  tasks: Task[],
  priorityFieldId: string,
  extensionFieldId: string
): Task[] => {
  const filteredTasks = tasks.filter((task) => {
    logMessage(
      "DEBUG",
      `Evaluating task "${task.name}" (ID: ${task.gid}) for updates.`
    );

    // Locate the Priority field within custom_fields
    const priorityField = task.custom_fields?.find(
      (field: CustomField) => field.gid === priorityFieldId
    );

    // Locate the Extension Processed field within custom_fields
    const extensionField = task.custom_fields?.find(
      (field: CustomField) => field.gid === extensionFieldId
    );

    // Extract values from the custom fields
    const priority = priorityField?.enum_value?.name || undefined;
    const isExtensionProcessed =
      extensionField?.enum_value?.gid === process.env.TRUE_ENUM_GID; // GID for "true"

    logMessage(
      "DEBUG",
      `Task "${task.name}" - Priority: ${
        priority || "Missing"
      }, Extension Processed: ${isExtensionProcessed ? "true" : "false"}`
    );

    // Skip tasks with undefined or missing priority, High priority, or already processed
    if (
      priority === "High" || // Skip if priority is High
      isExtensionProcessed // Skip if already processed
    ) {
      logMessage(
        "INFO",
        `Skipping task "${task.name}" (ID: ${task.gid}) - ${
          !priority
            ? !isExtensionProcessed
              ? "Priority is missing and not processed"
              : "Priority is missing"
            : priority === "High"
            ? "High priority"
            : "Already processed"
        }.`
      );
      return false;
    }

    return true;
  });

  logMessage(
    "INFO",
    `Found ${filteredTasks.length} tasks eligible for due date extension.`
  );

  return filteredTasks;
};

export const fixTask = async (taskId: string): Promise<void> => {
  logMessage("INFO", `Fixing task with ID: ${taskId}`);

  // Fetch task details from Asana API
  const { data: task } = await asanaClient.get(`/tasks/${taskId}`, {
    params: { opt_fields: "gid,name,custom_fields,due_on" }, // Include due_on in the API response
  });

  if (!task) {
    throw new AppError(404, `Task with ID ${taskId} not found.`);
  }

  logMessage("DEBUG", `Fetched task details: ${JSON.stringify(task)}`);

  const customFields: Record<string, string> = {};
  let needsUpdate = false;

  // Check extension_processed field
  const extensionFieldId = process.env.EXTENSION_PROCESSED_FIELD_ID!;

  // Log the entire task object for debugging
  console.log(JSON.stringify(task, null, 2));
  // Locate the Extension Processed field within custom_fields
  const extensionField = task.custom_fields?.find(
    (field: { gid: string }) => field.gid === extensionFieldId
  );

  if (!extensionField) {
    logMessage(
      "WARN",
      `Extension Processed field (gid: ${extensionFieldId}) not found in task ${task.gid}.`
    );
  }

  // Extract the `gid` from the `enum_value` of the located field, if present
  const currentExtensionValue = extensionField?.enum_value?.gid;

  console.log(`Current Extension Processed Value: ${currentExtensionValue}`);

  // Determine update based on due_on and current extension_processed value
  if (task.due_on) {
    if (currentExtensionValue === process.env.FALSE_ENUM_GID) {
      logMessage(
        "INFO",
        `Task ${taskId} already has extension_processed set to false. No update needed.`
      );
      return;
    }
    logMessage(
      "INFO",
      `Task ${taskId} has a due date (${task.due_on}). Setting extension_processed to false.`
    );
    customFields[extensionFieldId] = process.env.FALSE_ENUM_GID!;
    needsUpdate = true;
  } else {
    console.log(currentExtensionValue);
    if (currentExtensionValue === process.env.TRUE_ENUM_GID) {
      logMessage(
        "INFO",
        `Task ${taskId} already has extension_processed set to true. No update needed.`
      );
      return;
    }
    logMessage(
      "INFO",
      `Task ${taskId} is missing or has incorrect extension_processed. Setting it to true.`
    );
    customFields[extensionFieldId] = process.env.TRUE_ENUM_GID!;
    needsUpdate = true;
  }

  // Update the task if any changes are needed
  if (needsUpdate) {
    logMessage(
      "DEBUG",
      `Updating task ${taskId} with custom fields: ${JSON.stringify(
        customFields
      )}`
    );

    await asanaClient.put(`/tasks/${taskId}`, {
      data: { custom_fields: customFields },
    });

    logMessage("INFO", `Task ${taskId} successfully updated.`);
  }
};
