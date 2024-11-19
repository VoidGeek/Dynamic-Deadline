import express, { Request, Response } from "express";
import { calculateDueDate } from "../utils/calculateDueDate";
import {
  fetchInProgressTasks,
  updateTaskDueDate,
  asanaClient,
  Task,
} from "../models/task";
import { IN_PROGRESS_SECTION_ID } from "../config/env";

const router = express.Router();

// Create a task with an assigned due date
router.post("/tasks", async (req: Request, res: Response): Promise<void> => {
  const { name, priority } = req.body;

  if (!name || !priority) {
    res.status(400).json({ error: "Name and priority are required." });
    return;
  }

  const dueDate = calculateDueDate(priority);

  const response = await asanaClient.post("/tasks", {
    name,
    due_on: dueDate,
    workspace: "your_workspace_id", // Replace with your Asana workspace ID
    assignee: "me", // Or replace with a specific user ID or email
  });

  res.status(201).json({
    message: "Task created successfully with due date assigned.",
    task: response.data.data,
  });
});

// Move a task to "In Progress" and handle updates
router.patch(
  "/tasks/:id/progress",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const taskResponse = await asanaClient.get(`/tasks/${id}`, {
      params: { opt_fields: "name,priority,due_on" },
    });
    const task = taskResponse.data.data;

    if (!task) {
      res.status(404).json({ error: "Task not found." });
      return;
    }

    // Move task to "In Progress" section
    await asanaClient.post(`/sections/${IN_PROGRESS_SECTION_ID}/addTask`, {
      task: id,
    });

    // If priority is High, extend due dates for other tasks
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
  }
);

// Get all tasks in "In Progress"
router.get("/tasks/in-progress", async (req: Request, res: Response) => {
  const tasks = await fetchInProgressTasks();
  res.status(200).json(tasks);
});

export default router;