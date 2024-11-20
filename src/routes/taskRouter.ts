import express from "express";
import {
  createTask,
  moveTaskToInProgress,
  getInProgressTasks,
  getTasksByProject,
} from "../controllers/taskController";

const router = express.Router();

// Create a task with an assigned due date
router.post("/tasks", createTask);

// Move a task to "In Progress" and handle updates
router.patch("/tasks/:id/progress", moveTaskToInProgress);

// Get all tasks in "In Progress"
router.get("/tasks/in-progress", getInProgressTasks);

// Fetch tasks for a specific project
router.get("/tasks/:projectId", getTasksByProject);

export default router;
