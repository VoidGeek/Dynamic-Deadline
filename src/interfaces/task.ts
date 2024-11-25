// interfaces/task.ts

export interface Task {
  gid: string;
  name: string;
  due_on?: string; // Optional since it might be undefined
  priority?: string;
  custom_fields?: { [key: string]: any }; // Custom fields are key-value pairs
}

export interface CreateTaskRequest {
  name: string; // Name of the task (required)
  priority?: "Low" | "Medium" | "High"; // Priority of the task (optional)
  projects?: string[]; // List of project IDs (optional)
}

export interface CustomField {
  gid: string;
  enum_value?: { name: string };
}

export interface Event {
  action: string;
  resource: {
    gid: string;
    resource_type: string;
    resource_subtype?: string; // Optional property
  };
  parent?: {
    gid: string;
    resource_type: string;
  };
  change?: {
    field: string;
    action: string;
    new_value?: {
      gid: string;
      resource_type: string;
      resource_subtype?: string; // Optional property
      enum_value?: {
        gid: string;
        resource_type: string;
      };
    };
  };
  created_at?: string;
  user?: {
    gid: string;
    resource_type: string;
  };
}
