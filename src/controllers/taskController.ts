import { Request, Response } from "express";
import { asanaClient } from "../services/asanaClient";
import { calculateDueDate } from "../utils/calculateDueDate";
import {
  fetchInProgressTasks,
  updateTaskDueDate,
} from "../services/taskService";

const priorityGidMap: Record<string, string> = {
  Low: process.env.PRIORITY_LOW_ID!,
  Medium: process.env.PRIORITY_MEDIUM_ID!,
  High: process.env.PRIORITY_HIGH_ID!,
};

// Create a task with assigned due date and priority
export const createTask = async (req: Request, res: Response) => {
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

  sendResponse(res, 201, "Task created successfully.", response.data.data);
};

// Move a task to "In Progress" section
export const moveTaskToInProgress = async (req: Request, res: Response) => {
  const { id } = req.params;

  const taskResponse = await asanaClient.get(`/tasks/${id}`, {
    params: { opt_fields: "name,priority,due_on" },
  });
  const task = taskResponse.data.data;

  if (!task) {
    throw new AppError(404, "Task not found.");
  }

  await asanaClient.post(
    `/sections/${process.env.IN_PROGRESS_SECTION_ID!}/addTask`,
    {
      data: { task: id },
    }
  );

  if (task.priority === "High") {
    const inProgressTasks = await fetchInProgressTasks();

    await Promise.all(
      inProgressTasks
        .filter((t) => t.gid !== id)
        .map((t) => {
          const extendedDate = new Date(t.due_on || new Date());
          extendedDate.setDate(extendedDate.getDate() + 2);
          return updateTaskDueDate(
            t.gid,
            extendedDate.toISOString().split("T")[0]
          );
        })
    );
  }

  sendResponse(res, 200, "Task moved to In Progress successfully.");
};

// Fetch all tasks in "In Progress" section
export const getInProgressTasks = async (_req: Request, res: Response) => {
  const tasks = await fetchInProgressTasks();
  sendResponse(res, 200, "Fetched all tasks in progress.", tasks);
};

// Fetch tasks for a specific project
export const getTasksByProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const response = await asanaClient.get("/tasks", {
    params: { project: projectId },
  });

  sendResponse(res, 200, "Fetched tasks for the project.", response.data.data);
};
