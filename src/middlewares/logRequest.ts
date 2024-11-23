import { Request, Response, NextFunction } from "express";

/**
 * Middleware to log API execution details.
 * Logs the method, path, status code, response time, IST timestamp, and client IPv4 address.
 */
export const logRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;

    // Current time in IST
    const currentTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    // Resolve client IP
    const rawIp =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "Unknown IP";
    const clientIp = Array.isArray(rawIp)
      ? rawIp[0]
      : rawIp.startsWith("::ffff:")
      ? rawIp.slice(7)
      : rawIp === "::1"
      ? "127.0.0.1"
      : rawIp;

    // Get the response status code
    const statusCode = res.statusCode;

    // Log the details with HTTP method and status code formatting
    logMessage(
      "DEBUG",
      `API executed: ${req.originalUrl} | Status: ${statusCode} | Response Time: ${responseTime}ms | Time: ${currentTime} (IST) | IP: ${clientIp}`,
      undefined,
      req.method
    );
  });

  next();
};
