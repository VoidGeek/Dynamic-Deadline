import dotenv from "dotenv";

dotenv.config();

// List of required environment variables
const requiredEnvVariables = [
  "ASANA_ACCESS_TOKEN",
  "IN_PROGRESS_SECTION_ID",
  "DEFAULT_PROJECT_ID",
  "PRIORITY_CUSTOM_FIELD_ID",
  "PRIORITY_LOW_ID",
  "PRIORITY_MEDIUM_ID",
  "PRIORITY_HIGH_ID",
];

// Function to validate and retrieve environment variables
const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }
  return value;
};

// Load and export environment variables
export const ASANA_ACCESS_TOKEN = getEnvVariable("ASANA_ACCESS_TOKEN");
export const IN_PROGRESS_SECTION_ID = getEnvVariable("IN_PROGRESS_SECTION_ID");
export const DEFAULT_PROJECT_ID = getEnvVariable("DEFAULT_PROJECT_ID");
export const PRIORITY_CUSTOM_FIELD_ID = getEnvVariable(
  "PRIORITY_CUSTOM_FIELD_ID"
);
export const PRIORITY_LOW_ID = getEnvVariable("PRIORITY_LOW_ID");
export const PRIORITY_MEDIUM_ID = getEnvVariable("PRIORITY_MEDIUM_ID");
export const PRIORITY_HIGH_ID = getEnvVariable("PRIORITY_HIGH_ID");
