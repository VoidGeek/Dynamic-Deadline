import { Response } from "express";
import { AppError as AppErrorClass } from "../middlewares/errorHandler"; // Adjust the path as needed
import { logMessage as logMessageUtil } from "../utils/logger"; // Import logMessage type

declare global {
  var sendResponse: (
    res: Response,
    statusCode: number,
    message: string,
    data?: any
  ) => Response;
  var AppError: typeof AppErrorClass;
  var logMessage: typeof logMessageUtil; // Declare logMessage globally
}

export {};
