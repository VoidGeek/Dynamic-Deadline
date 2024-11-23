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
 */
export const logMessage = (
  level: keyof typeof levelColorMap = "DEFAULT",
  message: string,
  url?: string,
  method?: string
): void => {
  // Retrieve colors for log level and HTTP method
  const levelColor = levelColorMap[level.toUpperCase()] || levelColorMap.DEFAULT;
  const methodColor = methodColorMap[method?.toUpperCase() || "DEFAULT"];

  // Format and log the message
  console.log(
    `${levelColor(`[${level.toUpperCase()}]`)} ${
      method ? methodColor(`[${method.toUpperCase()}]`) : ""
    } ${kleur.grey(message)}${url ? ` ${kleur.green().underline(url)}` : ""}`
  );
};
