import "./config/global-utils"; // Initialize global utilities
import "./config/global-env";
import express from "express";
import taskRoutes from "./routes/taskRouter";
import { errorHandler } from "./middlewares/errorHandler";
import { logRequest } from "./middlewares/logRequest";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logRequest);
// Routes
app.use("/api", taskRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logMessage("info", "server running at", `http://localhost:${PORT}`);
});
