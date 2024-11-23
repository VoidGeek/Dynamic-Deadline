import { Response } from "express";

declare global {
  var sendResponse: (
    res: Response,
    statusCode: number,
    message: string,
    data?: any
  ) => Response;
  var AppError: typeof AppErrorClass;
  var logMessage: typeof logMessageUtil; // Declare logMessage globally
  var createRouter: typeof createRouterUtil;
}

export {};
