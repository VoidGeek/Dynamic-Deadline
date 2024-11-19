const priorityToDaysMap: Record<string, number> = {
  Low: 14,
  Mid: 7,
  High: 2,
};

export const calculateDueDate = (priority: string): string => {
  const daysToAdd = priorityToDaysMap[priority];
  if (!daysToAdd) {
    throw new Error(`Invalid priority: ${priority}`);
  }
  const now = new Date();
  now.setDate(now.getDate() + daysToAdd);
  return now.toISOString().split("T")[0];
};
