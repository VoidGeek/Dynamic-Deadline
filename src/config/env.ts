import dotenv from "dotenv";

dotenv.config();

export const ASANA_ACCESS_TOKEN = process.env.ASANA_ACCESS_TOKEN!;
export const IN_PROGRESS_SECTION_ID = process.env.IN_PROGRESS_SECTION_ID!;

if (!ASANA_ACCESS_TOKEN) {
  throw new Error("ASANA_ACCESS_TOKEN is not defined in environment variables");
}

if (!IN_PROGRESS_SECTION_ID) {
  throw new Error(
    "IN_PROGRESS_SECTION_ID is not defined in environment variables"
  );
}
