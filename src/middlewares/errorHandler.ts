import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default status and message
  let statusCode = err instanceof AppError ? err.status : 500;
  let errorMessage =
    err instanceof Error ? err.message : "Internal Server Error";
  let errors: { reason: string; help?: string }[] | null = null;

  // Handle Axios errors
  if ((err as any)?.response) {
    const axiosError = err as any;
    statusCode = axiosError.response.status || 500; // Use Axios response status
    errorMessage = axiosError.response.statusText || errorMessage;

    // Extract detailed error information
    const axiosErrors = axiosError.response.data?.errors;
    errors = axiosErrors
      ? axiosErrors.map(
          ({ message, help }: { message: string; help?: string }) => ({
            reason: message,
            help,
          })
        )
      : null;
  }

  // Log the error
  logMessage(
    "ERROR",
    `[${req.method}] ${req.originalUrl} - ${errorMessage}`,
    undefined
  );

  // Send response
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: errors ? "Detailed errors are available" : errorMessage,
    errors: errors || undefined,
  });
};
