import { asanaClient } from "./asanaClient";
import { Task } from "../interfaces/task";

// Fetch tasks in "In Progress" section
export const fetchInProgressTasks = async (): Promise<Task[]> => {
  const response = await asanaClient.get(
    `/sections/${process.env.IN_PROGRESS_SECTION_ID}/tasks`,
    {
      params: {
        opt_fields: "gid,name,due_on,priority",
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
};
