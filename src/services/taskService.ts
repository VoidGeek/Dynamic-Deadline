import { asanaClient } from "./asanaClient";
import { Task } from "../interfaces/task";
import { IN_PROGRESS_SECTION_ID } from "../config/env";

// Fetch tasks in "In Progress" section
export const fetchInProgressTasks = async (): Promise<Task[]> => {
  const response = await asanaClient.get(
    `/sections/${IN_PROGRESS_SECTION_ID}/tasks`,
    {
      params: {
        opt_fields: "gid,name,due_on,priority",
      },
    }
  );
  return response.data.data as Task[];
};

// Update a task's due date
export const updateTaskDueDate = async (
  taskId: string,
  newDueDate: string
): Promise<void> => {
  await asanaClient.put(`/tasks/${taskId}`, {
    due_on: newDueDate,
  });
};
