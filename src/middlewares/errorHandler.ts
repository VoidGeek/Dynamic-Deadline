import { Response } from "express";

export class AppError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: AppError | any, res: Response): void => {
  console.error(`[Error]: ${err.message}`);

  const statusCode = err.status || 500;
  const errorMessage = err.message || "Internal Server Error";

  // Check for Axios errors (from Asana API)
  const errors = err.response?.data?.errors?.map((error: any) => ({
    reason: error.message,
    help: error.help,
  }));

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    errors: errors || null,
  });
};
