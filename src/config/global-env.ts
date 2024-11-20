import { config } from "dotenv-safe";
// Load and validate environment variables globally
config({
  allowEmptyValues: false, // Ensure no variable is empty unless explicitly allowed
  example: ".env.example", // Path to the .env.example file for validation
});

// Log a message after loading the environment variables
logMessage("DEBUG", "Environment variables loaded globally.");
