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
    FALSE_ENUM_GID=
    ```

---

## Asana API CURL Commands for Configuration

Below are the required CURL commands to retrieve necessary details for configuring your `.env` file.

1.  Access Token:
    Generate the Asana Access Token directly from the Asana Developer Console. This value is not retrieved via API.

2.  WORKSPACE_ID:

    ```bash
    curl -X GET "https://app.asana.com/api/1.0/workspaces" \
    -H "Authorization: Bearer <ASANA_ACCESS_TOKEN>"
    ```

3.  DEFAULT_PROJECT_ID
    ```bash
    curl -X GET "https://app.asana.com/api/1.0/projects?workspace=<WORKSPACE_ID>" \
    -H "Authorization: Bearer <ASANA_ACCESS_TOKEN>"
    ```
4.  IN_PROGRESS_SECTION_ID

    ```bash
    curl -X GET "https://app.asana.com/api/1.0/projects/<PROJECT_ID>/sections" \
    -H "Authorization: Bearer <ASANA_ACCESS_TOKEN>"
    ```

5.  The "Priority" custom field will be an enum type with options: **Low**, **Medium**, and **High**.

    ```bash
    curl -X POST "https://app.asana.com/api/1.0/custom_fields" \
    -H "Authorization: Bearer <ASANA_ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
    "data": {
     "name": "Priority",
     "type": "enum",
     "enum_options": [
       { "name": "Low", "enabled": true },
       { "name": "Medium", "enabled": true },
       { "name": "High", "enabled": true }
     ],
     "workspace": "<WORKSPACE_ID>"
    }
    }'
    ```

6.  The "Extension Processed" field will be an enum type with options **true** and **false**.

    ```bash
    curl -X POST "https://app.asana.com/api/1.0/custom_fields" \
    -H "Authorization: Bearer <ASANA_ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
    "data": {
     "name": "Extension Processed",
     "type": "enum",
     "enum_options": [
       { "name": "true", "enabled": true },
       { "name": "false", "enabled": true }
     ],
     "workspace": "<WORKSPACE_ID>"
    }
    }'
    ```

7.  Attach the **"Priority"** Custom Field

    ```bash
    curl -X POST "https://app.asana.com/api/1.0/projects/<PROJECT_ID>/addCustomFieldSetting" \
    -H "Authorization: Bearer <ASANA_ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
    "data": {
     "custom_field": "<PRIORITY_CUSTOM_FIELD_ID>", // Replace with the ID of the "Priority" field
     "is_important": true
    }
    }'
    ```

8.  Attach the **"Extension Processed"** Custom Field

    ```bash
    curl -X POST "https://app.asana.com/api/1.0/projects/<PROJECT_ID>/addCustomFieldSetting" \
    -H "Authorization: Bearer <ASANA_ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
    "data": {
     "custom_field": "<EXTENSION_PROCESSED_FIELD_ID>", // Replace with the ID of the "Extension Processed" field
     "is_important": false
    }
    }'
    ```

9.  PRIORITY_CUSTOM_FIELD_ID, PRIORITY_LOW_ID, PRIORITY_MEDIUM_ID and PRIORITY_HIGH_ID

    ```bash
    curl -X GET "https://app.asana.com/api/1.0/projects/<project_id>/custom_field_settings" \
    -H "Authorization: Bearer <ASANA_ACCESS_TOKEN>"
    ```

10. EXTENSION_PROCESSED_FIELD_ID, TRUE_ENUM_GID and FALSE_ENUM_GID

    ```bash
    curl -X GET "https://app.asana.com/api/1.0/projects/<project_id>/custom_field_settings" \
    -H "Authorization: Bearer <ASANA_ACCESS_TOKEN>"
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
6. **Run in Production Mode (Optional)**
   Start the compiled application in production mode:
   ```bash
   pnpm start
   ```
7. **Clean the Project (Optional)**
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
   - `wrappedRouter`: A utility that extends the Express Router to automatically register routes in a centralized registry for better API tracking and debugging in logs.

2. **Task Progress Management**:

   - Move tasks to the "In Progress" section for better tracking.

3. **Task Retrieval**:

   - Fetch all tasks from a specific project.
   - Retrieve tasks that are currently in the "In Progress" section.

4. **Error Handling**:

   - Centralized error handling for API failures and invalid requests.
   - User-friendly error messages with proper HTTP status codes.

---

## **Technical Approach**

1. **Custom Field Management**:

   - Created two custom fields: `Priority` and `Extension Processed`.
   - Attached these custom fields to relevant projects using Asana’s API.

2. **Task Creation Workflow**:

   - Tasks without priority skip due date calculation and have "Extension Processed" set to `true`.
   - Tasks with a valid priority have due dates calculated based on the priority and "Extension Processed" set to `false`.
   - Priority is validated against allowed values (`Low`, `Medium`, `High`). Invalid inputs result in a `400 Bad Request` error.

3. **Task Movement Workflow**:

   - Fetched all tasks in the "In Progress" section.
   - Filtered tasks to exclude those with `High` priority, already processed extensions, or undefined priority.
   - Updated eligible tasks by assigning new due dates and marking them as processed.

4. **Logging Enhancements**:

   - Implemented structured logging with levels: `DEBUG`, `INFO`, `WARN`, and `ERROR`.
   - Logged task creation, updates, and error scenarios for better debugging and transparency.

5. **Error Handling Improvements**:

   - Centralized error handling for consistent feedback.
   - Missing fields or invalid custom field values trigger descriptive error messages with proper status codes.

---

## **Trial and Error**

### **1. Propagating Custom Fields at the Workspace Level**

- **Assumption**:
  Custom fields could be globally attached to a workspace, making them automatically available for all projects.
- **Outcome**:
  This approach failed, as Asana requires explicit attachment of custom fields to each project.

### **2. Dynamic Field Assignment**

- **Attempt**:
  -Dynamically assign custom fields during task creation.
- **Outcome**:
  -This approach proved overly complex and less efficient than pre-attaching fields to projects.

### **3. API Behavior with Default Values**

- **Assumption**:
  Asana's default handling for dropdown fields would automatically apply a `"None"` value.
- **Outcome**:
  Runtime issues arose, leading to explicit handling of default priority values and consistent custom field settings.

### **4. Task Filtering Optimization**

- **Initial Implementation**:
  Redundantly fetched and updated all tasks in a section, resulting in performance bottlenecks.
- **Outcome**:
  Optimized filtering logic to skip unnecessary updates by pre-checking the priority and processed status of tasks.

### **5. Validation with TypeScript vs Runtime**

- **Initial Approach**:
  Relied solely on TypeScript interfaces for validating priority values.
- **Outcome**:
  TypeScript validation was insufficient for invalid inputs received via API requests.
  Added explicit validation in the controllers for runtime checks.

---

## **Outcome**

The final solution:

1. **Accurate Custom Field Management**:
   Pre-attached fields to projects for efficient and consistent task creation.
2. **Validated Workflows**:
   Handles task creation and movement efficiently, including default behaviors for missing fields.
3. **Improved Logging**:
   Provides clear and meaningful logs for better transparency and debugging and is production-ready.
4. **Optimized API Interactions**:
   Filters and updates tasks only when necessary, improving performance and reducing redundant API calls using recursion.

## **Additional Improvements**

I have added some improvements upon feedback:

1. **Webhook Integration with ngrok**  
   Integrated webhooks using `ngrok` to expose a local server, enabling seamless communication between Asana and the application.

   ```bash
    ngrok http <port>
   ```

2. **Webhook Registration**  
    Used a `curl` command to register the webhook URL with Asana. The entire process is automated, ensuring smooth and efficient task updates.

   ```bash
    curl --request POST \
     --url https://app.asana.com/api/1.0/webhooks \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --header 'Authorization: Bearer 2/1208796518383027/1208796540887303:4cfae280ec1bfeaf221da03f1438bc1c' \
     --data '
      {
      "data": {
      "resource": "1208796267729729",
      "target": "<WebhookURL>/webhook"
         }
      }
      '
   ```

3. **Purpose of Using Webhooks**

   - Enables real-time updates from Asana whenever tasks or projects are modified.
   - Keeps the application synchronized without constant polling.
   - Reduces server load for better efficiency.

4. **Why Webhooks Instead of WebSockets**

   - Webhooks fit Asana's event-driven API for asynchronous updates.
   - WebSockets, designed for continuous communication, are unnecessary for task updates.
   - Webhooks are simpler, more reliable, and resource-efficient.

5. **Fully Automated Workflow**
   - After registration, updates are processed automatically without manual intervention.
   - Ensures seamless interaction with the Asana UI, reducing maintenance.
