import { asanaClient } from "./asanaClient";
import { CustomField, Task } from "../interfaces/task";

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
