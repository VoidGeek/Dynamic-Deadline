import { Response } from "express";
import { AppError as AppErrorClass } from "../middlewares/errorHandler"; // Adjust the path as needed
import { logMessage as logMessageUtil } from "../utils/logger"; // Import logMessage utility

// Attach global utilities
globalThis.sendResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any = null
): Response => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  });
};

globalThis.AppError = AppErrorClass;
globalThis.logMessage = logMessageUtil; // Attach logMessage to globalThis

logMessageUtil("DEBUG", "Global utilities initialized.");

export {};
