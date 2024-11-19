import axios from "axios";
import { ASANA_ACCESS_TOKEN, IN_PROGRESS_SECTION_ID } from "../config/env";

// Asana API client
export const asanaClient = axios.create({
  baseURL: "https://app.asana.com/api/1.0",
  headers: {
    Authorization: `Bearer ${ASANA_ACCESS_TOKEN}`,
  },
});

// Task interface
export interface Task {
  gid: string;
  name: string;
  due_on?: string; // Optional since it might be undefined
  priority?: string;
}

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
