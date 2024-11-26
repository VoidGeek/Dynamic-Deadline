import {
  createTask,
  moveTaskToInProgress,
  getInProgressTasks,
  getTasksByProject,
  fixTaskController,
  updateTaskPriorityAndDueDate,
  updateHighPriorityTaskOnRemoval,
} from "../controllers/taskController";

const router = createRouter(); // Use WrapRouter `createRouter` instead of `Router`

// Create a task with an assigned due date
router.post("/tasks", createTask);

// Move a task to "In Progress" and handle updates
router.patch("/tasks/:id/progress", moveTaskToInProgress);

router.patch("/tasks/:id/priority", updateTaskPriorityAndDueDate);
// Fix a task by ID
router.patch("/tasks/:id/fix", fixTaskController);
// Get all tasks in "In Progress"
router.get("/tasks/in-progress", getInProgressTasks);

// Fetch tasks for a specific project
router.get("/tasks/:projectId", getTasksByProject);

router.put("/tasks/:id/remove", updateHighPriorityTaskOnRemoval);

export default router;
