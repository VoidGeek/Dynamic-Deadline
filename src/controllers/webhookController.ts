import { Request, Response } from "express";
import axios from "axios";

const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:3001"; // Your API base URL

// Map enum option GIDs to priorities
const priorityEnumMap: Record<string, string> = {
  [process.env.PRIORITY_LOW_ID!]: "Low",
  [process.env.PRIORITY_MEDIUM_ID!]: "Medium",
  [process.env.PRIORITY_HIGH_ID!]: "High",
};

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

    // Handle priority changes
    if (
      event.action === "changed" &&
      event.resource?.resource_type === "task" &&
      event.change?.field === "custom_fields" &&
      event.change?.new_value?.resource_subtype === "enum"
    ) {
      logMessage(
        "INFO",
        `Task ${taskId} custom field (likely priority) changed.`
      );

      const enumValueGid = event.change.new_value?.enum_value?.gid;

      if (!enumValueGid) {
        logMessage(
          "WARN",
          `Task ${taskId} custom field change does not include enum value.`
        );
        continue;
      }

      // Map the enumValueGid to priority
      const priority = priorityEnumMap[enumValueGid];
      if (!priority) {
        logMessage(
          "WARN",
          `Task ${taskId} custom field enum value GID ${enumValueGid} does not match any priority.`
        );
        continue;
      }

      logMessage("INFO", `Task ${taskId} priority determined as: ${priority}.`);

      // Call the API to update the task based on the new priority
      const response = await axios.patch(
        `${BASE_API_URL}/api/tasks/${taskId}/priority`,
        { priority }
      );

      if (response.status !== 200) {
        logMessage(
          "ERROR",
          `Unexpected response from API for task ${taskId}: ${response.status}`,
          response.data
        );
        throw new AppError(500, `Failed to update task ${taskId} priority.`);
      }

      logMessage(
        "INFO",
        `Task ${taskId} priority successfully updated to: ${priority} via API.`
      );
    }

    // Handle other criteria (like tasks added to Default/In Progress sections)
    if (
      event.action === "added" &&
      event.resource?.resource_type === "task" &&
      parentId === process.env.DEFAULT_SECTION_ID
    ) {
      logMessage("INFO", `Task ${taskId} added to Default section.`);

      const response = await axios.patch(
        `${BASE_API_URL}/api/tasks/${taskId}/fix`
      );

      if (response.status !== 200) {
        logMessage(
          "ERROR",
          `Unexpected response from API for task ${taskId}: ${response.status}`,
          response.data
        );
        throw new AppError(500, `Failed to fix task ${taskId}.`);
      }

      logMessage("INFO", `Task ${taskId} successfully fixed.`);
    }

    if (
      event.action === "added" &&
      event.resource?.resource_type === "task" &&
      parentId === process.env.IN_PROGRESS_SECTION_ID
    ) {
      logMessage("INFO", `Task ${taskId} added to In Progress section.`);

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
          `Failed to move task ${taskId} to In Progress.`
        );
      }

      logMessage("INFO", `Task ${taskId} successfully moved to In Progress.`);
    } else {
      logMessage(
        "DEBUG",
        `Event did not match any defined criteria: ${JSON.stringify(event)}`
      );
    }
  }

  sendResponse(res, 200, "Webhook events processed.");
};
