import express, { Request, Response } from "express";
import { calculateDueDate } from "../utils/calculateDueDate";
import {
  fetchInProgressTasks,
  updateTaskDueDate,
  asanaClient,
  Task,
} from "../models/task";
import {
  IN_PROGRESS_SECTION_ID,
  DEFAULT_PROJECT_ID,
  PRIORITY_CUSTOM_FIELD_ID,
  PRIORITY_LOW_ID,
  PRIORITY_MEDIUM_ID,
  PRIORITY_HIGH_ID,
} from "../config/env";
import { AppError } from "../middlewares/errorHandler";

const router = express.Router();

// Create a task with an assigned due date
router.post("/tasks", async (req: Request, res: Response) => {
  const { name, priority, projects } = req.body;

  if (!name || !priority) {
    throw new AppError(400, "Name and priority are required.");
  }

  const projectIds = Array.isArray(projects) ? projects : [DEFAULT_PROJECT_ID];

  const priorityGidMap: Record<string, string> = {
    Low: PRIORITY_LOW_ID,
    Medium: PRIORITY_MEDIUM_ID,
    High: PRIORITY_HIGH_ID,
  };

  if (!priorityGidMap[priority]) {
    throw new AppError(
      400,
      "Invalid priority value. Must be 'Low', 'Medium', or 'High'."
    );
  }

  const dueDate = calculateDueDate(priority);

  const response = await asanaClient.post("/tasks", {
    data: {
      name,
      projects: projectIds,
      due_on: dueDate,
      custom_fields: {
        [PRIORITY_CUSTOM_FIELD_ID]: priorityGidMap[priority],
      },
    },
  });

  res.status(201).json({
    message: "Task created successfully with due date and priority assigned.",
    task: response.data.data,
  });
});

// Move a task to "In Progress" and handle updates
router.patch("/tasks/:id/progress", async (req: Request, res: Response) => {
  const { id } = req.params;

  const taskResponse = await asanaClient.get(`/tasks/${id}`, {
    params: { opt_fields: "name,priority,due_on" },
  });
  const task = taskResponse.data.data;

  if (!task) {
    throw new AppError(404, "Task not found.");
  }

  // Move task to "In Progress" section
  await asanaClient.post(`/sections/${IN_PROGRESS_SECTION_ID}/addTask`, {
    data: {
      task: id,
    },
  });

  if (task.priority === "High") {
    const inProgressTasks = await fetchInProgressTasks();

    await Promise.all(
      inProgressTasks
        .filter((t: Task) => t.gid !== id)
        .map((t: Task) => {
          const extendedDate = new Date(t.due_on || new Date());
          extendedDate.setDate(extendedDate.getDate() + 2);
          return updateTaskDueDate(
            t.gid,
            extendedDate.toISOString().split("T")[0]
          );
        })
    );
  }

  res.status(200).json({
    message: "Task moved to In Progress and updated successfully.",
  });
});

// Get all tasks in "In Progress"
router.get("/tasks/in-progress", async (req: Request, res: Response) => {
  const tasks = await fetchInProgressTasks();
  res.status(200).json(tasks);
});

// Fetch tasks for a specific project
router.get("/tasks/:projectId", async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const response = await asanaClient.get("/tasks", {
    params: { project: projectId },
  });

  res.status(200).json({
    success: true,
    message: `Tasks fetched successfully for project ID: ${projectId}`,
    tasks: response.data.data,
  });
});

export default router;
