import axios from "axios";

// Asana API client instance
export const asanaClient = axios.create({
  baseURL: "https://app.asana.com/api/1.0",
  headers: {
    Authorization: `Bearer ${process.env.ASANA_ACCESS_TOKEN}`,
  },
});
