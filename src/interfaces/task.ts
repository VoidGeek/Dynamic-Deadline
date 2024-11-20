// interfaces/task.ts

export interface Task {
  gid: string;
  name: string;
  due_on?: string; // Optional since it might be undefined
  priority?: string;
  custom_fields?: { [key: string]: any }; // Custom fields are key-value pairs
}
