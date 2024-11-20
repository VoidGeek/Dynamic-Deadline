import { config } from "dotenv-safe";

// Load and validate environment variables
config({
  allowEmptyValues: false, // Ensure no variable is empty unless explicitly allowed
  example: ".env.example", // Path to the .env.example file for validation
});

// Directly export environment variables
export const ASANA_ACCESS_TOKEN = process.env.ASANA_ACCESS_TOKEN!;
export const IN_PROGRESS_SECTION_ID = process.env.IN_PROGRESS_SECTION_ID!;
export const DEFAULT_PROJECT_ID = process.env.DEFAULT_PROJECT_ID!;
export const PRIORITY_CUSTOM_FIELD_ID = process.env.PRIORITY_CUSTOM_FIELD_ID!;
export const PRIORITY_LOW_ID = process.env.PRIORITY_LOW_ID!;
export const PRIORITY_MEDIUM_ID = process.env.PRIORITY_MEDIUM_ID!;
export const PRIORITY_HIGH_ID = process.env.PRIORITY_HIGH_ID!;
