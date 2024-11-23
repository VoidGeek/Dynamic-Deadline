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
- **Express.js**: Version 5.xx
- **TypeScript**: ES2020 support
- **PNPM**: Latest version
- **Environment Variables**:

  - Create a `.env` file in the root directory with the following:
  - Refer the .env.example which was done through dotenv-safe.

    ```env
    ASANA_ACCESS_TOKEN=
    IN_PROGRESS_SECTION_ID=
    PORT=

    DEFAULT_PROJECT_ID=
    WORKSPACE_ID=

    PRIORITY_CUSTOM_FIELD_ID=
    PRIORITY_LOW_ID=
    PRIORITY_MEDIUM_ID=
    PRIORITY_HIGH_ID=

    EXTENSION_PROCESSED_FIELD_ID=
    TRUE_ENUM_GID=
    ```

---

## **Setup**

1. Clone the repository:
   ```bash
   git clone https://github.com/VoidGeek/PRADYUMNA-P-DYNAMIC-DEADLINE-SAHYADRI.git
   cd PRADYUMNA-P-DYNAMIC-DEADLINE-SAHYADRI
   ```
2. **Install Dependencies**  
   Install all required packages using PNPM:
   ```bash
   pnpm install
   ```
3. **Compile the Code** (for Production) 
   Build the TypeScript code into JavaScript:

   ```bash
   pnpm build
   ```

4. **Run the Development Server**  
   Start the development server with hot-reloading:
   ```bash
   pnpm dev
   ```
5. **Run the Development Server in Strict Mode(Optional)**  
   Start the development server with additional strict type checks:  
   ```bash
   pnpm dev:strict
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

---

## **Scripts**

- `pnpm dev` - Runs the application in development mode using `ts-node-dev` with hot-reloading.
- `pnpm dev:strict` - Runs a full TypeScript type-check (`tsc --noEmit`) and then starts the development server.
- `pnpm build` - Compiles the TypeScript source code into JavaScript.
- `pnpm start` - Runs the compiled application in production mode from `dist/index.js`.
- `pnpm clean` - Deletes the `dist` directory and removes compiled `.js` files.

---

## **Features**

1. **Global Utilities**:

   - `AppError`: Centralized error-handling class for consistent API error responses.
   - `sendResponse`: Standardized response utility for returning consistent JSON responses.
   - `logMessage`: A structured, color-coded logging utility for enhanced debugging.

2. **Task Creation**:

   - Create tasks with due dates, priorities, and optional project assignments.
   - Automatically assigns tasks to the default project if no project ID is provided.
   - Supports priority customization using pre-defined fields.

3. **Task Progress Management**:

   - Move tasks to the "In Progress" section for better tracking.
   - Supports real-time updates with Asana API integration.

4. **Task Retrieval**:

   - Fetch all tasks from a specific project.
   - Retrieve tasks that are currently in the "In Progress" section.

5. **Custom Priority Management**:

   - Use priority levels (`Low`, `Medium`, `High`) to organize tasks effectively.
   - Custom field IDs for priorities and extension processed are configurable via .env and .env.example

6. **Error Handling**:

   - Centralized error handling for API failures and invalid requests.
   - User-friendly error messages with proper HTTP status codes with custom logs.

