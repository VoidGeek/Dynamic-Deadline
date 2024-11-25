import { Request, Response } from "express";
import axios from "axios";
import { Event } from "../interfaces/task";

const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:3001";

// Map enum option GIDs to priorities
const priorityEnumMap: Record<string, string> = {
  [process.env.PRIORITY_LOW_ID!]: "Low",
  [process.env.PRIORITY_MEDIUM_ID!]: "Medium",
  [process.env.PRIORITY_HIGH_ID!]: "High",
};

export const handleWebhook = async (req: Request, res: Response) => {
  const hookSecret = req.header("X-Hook-Secret");

  // Webhook validation
  if (hookSecret) {
    res.setHeader("X-Hook-Secret", hookSecret);
    return res.status(200).send("Webhook validated successfully.");
  }

  const events: Event[] = req.body.events;

  if (!events || events.length === 0) {
    return res.status(200).send("No events to process.");
  }

  await Promise.all(
    events.map(async (event) => {
      const { gid: taskId } = event.resource || {};
      const { gid: parentId } = event.parent || {};

      try {
        // Handle tasks added to "Default" section
        if (
          event.action === "added" &&
          parentId === process.env.DEFAULT_SECTION_ID &&
          event.resource?.resource_type === "task"
        ) {
          await axios.patch(`${BASE_API_URL}/api/tasks/${taskId}/fix`);
        }

        // Handle tasks added to "In Progress" section
        if (
          event.action === "added" &&
          parentId === process.env.IN_PROGRESS_SECTION_ID &&
          event.resource?.resource_type === "task"
        ) {
          await axios.patch(`${BASE_API_URL}/api/tasks/${taskId}/progress`);
        }

        // Handle priority changes
        if (
          event.action === "changed" &&
          event.resource?.resource_type === "task" &&
          event.change?.field === "custom_fields" &&
          event.change?.new_value?.resource_subtype === "enum"
        ) {
          const enumValueGid: string | undefined =
            event.change.new_value?.enum_value?.gid;

          // Ensure enumValueGid is defined before using it as an index
          if (enumValueGid) {
            const priority = priorityEnumMap[enumValueGid];
            if (priority) {
              await axios.patch(
                `${BASE_API_URL}/api/tasks/${taskId}/priority`,
                {
                  priority,
                }
              );
            }
          }
        }
      } catch (error) {
        console.error(`Error processing event for task ${taskId}:`, error);
      }
    })
  );

  res.status(200).send("Webhook events processed.");
};
