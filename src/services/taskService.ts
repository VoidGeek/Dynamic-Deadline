import { asanaClient } from "./asanaClient";
import { CustomField, Task } from "../interfaces/task";
import { fetchTasksFromSection } from "../utils/fetchTasksFromSection";

// Fetch tasks in "In Progress" section
export const fetchInProgressTasks = async (): Promise<Task[]> => {
  return fetchTasksFromSection(process.env.IN_PROGRESS_SECTION_ID!, [
    "gid",
    "name",
    "due_on",
    "custom_fields", // Fetch Priority and Extension Processed
  ]);
};


export const fetchTaskFromDefaultSection = async (): Promise<any[]> => {
  return fetchTasksFromSection(process.env.DEFAULT_SECTION_ID!, [
    "gid",
    "name",
    "custom_fields",
    "due_on",
  ]);
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

  // Fetch all tasks from the default section
  const tasks = await fetchTaskFromDefaultSection();

  // Find the specific task by ID
  const task = tasks.find((t) => t.gid === taskId);

  if (!task) {
    throw new AppError(
      404,
      `Task with ID ${taskId} not found in the default section.`
    );
  }

  logMessage("DEBUG", `Fetched task details: ${JSON.stringify(task)}`);

  const customFields: Record<string, string> = {};
  let needsUpdate = false;

  // Check extension_processed field
  const extensionFieldId = process.env.EXTENSION_PROCESSED_FIELD_ID!;
  const extensionField = task.custom_fields?.find(
    (field: { gid: string }) => field.gid === extensionFieldId
  );

  if (!extensionField) {
    logMessage(
      "WARN",
      `Extension Processed field (gid: ${extensionFieldId}) not found in task ${task.gid}.`
    );
  }

  const currentExtensionValue = extensionField?.enum_value?.gid;

  logMessage(
    "DEBUG",
    `Current Extension Processed Value: ${currentExtensionValue}`
  );

  // Determine update based on due_on and current extension_processed value
  if (task.due_on) {
    if (currentExtensionValue === process.env.FALSE_ENUM_GID) {
      logMessage(
        "INFO",
        `Task ${taskId} already has extension_processed set to false. No update needed.`
      );
      return;
    }
    customFields[extensionFieldId] = process.env.FALSE_ENUM_GID!;
    needsUpdate = true;
  } else {
    if (currentExtensionValue === process.env.TRUE_ENUM_GID) {
      logMessage(
        "INFO",
        `Task ${taskId} already has extension_processed set to true. No update needed.`
      );
      return;
    }
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
