import express from "express";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRouter";
import { errorHandler } from "./middlewares/errorHandler";
import kleur from "kleur";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/api", taskRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `${kleur.yellow("[info]")} ${kleur.grey("server running at")} ${kleur
      .green()
      .underline(`http://localhost:${PORT}`)}`
  );
});
