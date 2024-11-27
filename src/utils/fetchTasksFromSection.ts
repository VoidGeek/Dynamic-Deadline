import { asanaClient } from "../services/asanaClient";

/**
 * Fetches tasks from a given section in Asana.
 * @param sectionId The ID of the section to fetch tasks from.
 * @param fields The fields to include in the response.
 * @returns An array of tasks from the specified section.
 */
export const fetchTasksFromSection = async (
  sectionId: string,
  fields: string[]
): Promise<any[]> => {
  const response = await asanaClient.get(`/sections/${sectionId}/tasks`, {
    params: {
      opt_fields: fields.join(","), // Join fields into a comma-separated string
    },
  });

  return response.data.data as any[];
};
