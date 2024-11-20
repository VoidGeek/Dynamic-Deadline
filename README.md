# **PRADYUMNA P-DYNAMIC DEADLINE-SAHYADRI**

A Node.js API for managing tasks in Asana, built with Express.js, TypeScript, and PNPM.

---

## **Endpoints**

1. **POST** `/tasks` - Create a task with a due date and priority.
2. **PATCH** `/tasks/:id/progress` - Move a task to the "In Progress" section.
3. **GET** `/tasks/in-progress` - Retrieve all tasks in the "In Progress" section.
4. **GET** `/tasks/:projectId` - Fetch tasks for a specific project.

---

## **Prerequisites**

Ensure you have the following installed on your system:

- **Node.js**: Version 14.x or higher
- **Express.js**: Version 5.x
- **TypeScript**: ES2020 support
- **PNPM**: Latest version
- **Environment Variables**:

  - Create a `.env` file in the `src/config/` directory with the following:

    ```env
    ASANA_ACCESS_TOKEN=your_asana_access_token
    IN_PROGRESS_SECTION_ID=your_section_id
    DEFAULT_PROJECT_ID=your_default_project_id
    PRIORITY_CUSTOM_FIELD_ID=your_custom_field_id
    PRIORITY_LOW_ID=your_low_priority_id
    PRIORITY_MEDIUM_ID=your_medium_priority_id
    PRIORITY_HIGH_ID=your_high_priority_id
    ```

---

## **Setup**

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/asana-task-manager.git
   cd asana-task-manager
   ```
2. **Install Dependencies**  
   Install all required packages using PNPM:
   ```bash
   pnpm install
   ```
3. **Compile the Code**  
   Build the TypeScript code into JavaScript:

   ```bash
   pnpm build
   ```

4. **Run the Development Server**  
   Start the development server with hot-reloading:
   ```bash
   pnpm dev
   ```
5. **Run in Production Mode (Optional)**  
   Start the compiled application in production mode:
   ```bash
   pnpm start
   ```
6. **Clean the Project (Optional)**  
   Remove compiled files and reset the project:
   ```bash
   pnpm clean
   ```

## **Scripts**

- `pnpm dev` - Runs the application in development mode using `nodemon` to monitor changes in `src/index.ts`.
- `pnpm build` - Compiles the TypeScript source code into JavaScript.
- `pnpm start` - Runs the compiled application in production mode from `dist/index.js`.
- `pnpm test` - Placeholder for testing, currently outputs an error message.
- `pnpm clean` - Deletes the `dist` directory and removes all
  `.js` files in the `src` directory.

---

## **Features**

1. **Task Creation**:

   - Create tasks with due dates, priorities, and optional project assignment.
   - Automatically assigns tasks to the default project if no project ID is provided.
   - Supports priority customization using pre-defined fields.

2. **Task Progress Management**:

   - Move tasks to the "In Progress" section for better tracking.
   - Supports real-time updates with Asana API integration.

3. **Task Retrieval**:

   - Fetch all tasks from a specific project.
   - Retrieve tasks that are currently in the "In Progress" section.

4. **Custom Priority Management**:

   - Use priority levels (`low`, `medium`, `high`) to organize tasks effectively.
   - Custom field IDs for priorities are configurable via environment variables.

5. **Error Handling**:

   - Centralized error handling for API failures and invalid requests.
   - User-friendly error messages with proper HTTP status codes.

6. **Production-Ready**:
   - Fully TypeScript-typed for stability and scalability.
   - Easy to deploy using Node.js and Asana API authentication.

---

## **License**

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
