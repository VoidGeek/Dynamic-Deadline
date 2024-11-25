import { Request, Response } from "express";
import axios from "axios";

const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:3001"; // Your API base URL

export const handleWebhook = async (req: Request, res: Response) => {
  // Handle Asana webhook validation
  const hookSecret = req.header("X-Hook-Secret");
  if (hookSecret) {
    logMessage("INFO", "Asana webhook validation received.");
    res.setHeader("X-Hook-Secret", hookSecret);
    return sendResponse(res, 200, "Webhook validated successfully.");
  }

  logMessage("DEBUG", "Webhook payload received:", req.body);

  const events = req.body.events;

  if (!events || events.length === 0) {
    logMessage("WARN", "No events to process.");
    return sendResponse(res, 200, "No events to process.");
  }

  for (const event of events) {
    logMessage("DEBUG", `Processing event: ${JSON.stringify(event)}`);

    const taskId = event.resource?.gid;
    const parentId = event.parent?.gid;

    // Check if the action is "added" and parent matches "In Progress" section
    if (
      event.action === "added" &&
      parentId === process.env.IN_PROGRESS_SECTION_ID &&
      event.resource?.resource_type === "task"
    ) {
      logMessage("INFO", `Task ${taskId} added to "In Progress" section.`);

      const response = await axios.patch(
        `${BASE_API_URL}/api/tasks/${taskId}/progress`
      );

      if (response.status !== 200) {
        logMessage(
          "ERROR",
          `Unexpected response from API for task ${taskId}: ${response.status}`,
          response.data
        );
        throw new AppError(
          500,
          `Failed to move task ${taskId} to "In Progress".`
        );
      }

      logMessage(
        "INFO",
        `Task ${taskId} successfully moved to "In Progress" via API.`
      );
    } else {
      logMessage(
        "DEBUG",
        `Event did not match "In Progress" criteria: ${JSON.stringify(event)}`
      );
    }
  }

  sendResponse(res, 200, "Webhook events processed.");
};
