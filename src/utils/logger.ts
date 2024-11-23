import kleur from "kleur";

// Map log levels to colors
const levelColorMap: Record<string, (text: string) => string> = {
  INFO: kleur.cyan,
  ERROR: kleur.red,
  WARN: kleur.yellow,
  DEBUG: kleur.green,
  DEFAULT: kleur.blue,
};

// Map HTTP methods to colors
const methodColorMap: Record<string, (text: string) => string> = {
  GET: kleur.cyan,
  POST: kleur.magenta,
  PUT: kleur.yellow,
  DELETE: kleur.red,
  PATCH: kleur.green,
  DEFAULT: kleur.white,
};

/**
 * Logs a message with a specific log level and formatting.
 * Formats HTTP methods and URLs with specific colors.
 * @param level The log level (e.g., INFO, ERROR, WARN, DEBUG).
 * @param message The message to log.
 * @param url Optional URL to highlight.
 * @param method Optional HTTP method to format.
 * @param log Whether to log the message directly (default: true).
 * @returns Formatted message for cases where the function is used for constructing logs.
 */
export const logMessage = (
  level: keyof typeof levelColorMap = "DEFAULT",
  message: string,
  url?: string,
  method?: string,
  log: boolean = true
): string => {
  // Retrieve colors for log level and HTTP method
  const levelColor =
    levelColorMap[level.toUpperCase()] || levelColorMap.DEFAULT;
  const methodColor = methodColorMap[method?.toUpperCase() || "DEFAULT"];

  // Format the HTTP method only (for route coloring)
  if (!message && method && !log) {
    return methodColor(`[${method.toUpperCase()}]`);
  }

  // Format the message with level, method, and optional URL
  const formattedMethod = method
    ? methodColor(`[${method.toUpperCase()}]`)
    : "";
  const formattedMessage = `${levelColor(`[${level.toUpperCase()}]`)} ${
    formattedMethod ? `${formattedMethod} ` : ""
  }${kleur.grey(message)}${url ? ` ${kleur.green().underline(url)}` : ""}`;

  // Log directly if `log` is true
  if (log) {
    console.log(formattedMessage);
  }

  return formattedMessage;
};
