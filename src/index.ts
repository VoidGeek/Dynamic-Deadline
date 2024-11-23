import "./config/global-utils"; // Initialize global utilities
import "./config/global-env";
import express from "express";
import taskRoutes from "./routes/taskRouter";
import { logRequest } from "./middlewares/logRequest";
import { routeRegistry, Route } from "./config/routeRegistry"; // Import Route type
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(logRequest);

// Routes
app.use("/api", taskRoutes);

// Error Handling
app.use(errorHandler);

// Log available APIs during startup
app.listen(PORT, () => {
  logMessage("INFO", "Server running at", `http://localhost:${PORT}`);

  // Explicitly infer the type of routes
  const routes: Route[] = routeRegistry.getAll();

  // Start with a clean header
  console.log("[INFO]  Available APIs:");

  // Display each route without repeated [INFO] prefix
  routes.forEach((route) => {
    const coloredMethod = logMessage(
      undefined, // Use neutral log level
      "",
      undefined,
      route.method,
      false // Prevent direct logging
    );
    console.log(`   ${coloredMethod} /api${route.path}`);
  });
});
