// Task model interface
export interface Task {
  gid: string;
  name: string;
  due_on?: string; // Optional since it might be undefined
  priority?: string;
}
