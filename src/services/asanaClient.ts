import axios from "axios";
import { ASANA_ACCESS_TOKEN } from "../config/env";

// Asana API client instance
export const asanaClient = axios.create({
  baseURL: "https://app.asana.com/api/1.0",
  headers: {
    Authorization: `Bearer ${ASANA_ACCESS_TOKEN}`,
  },
});
