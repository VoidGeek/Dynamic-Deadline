import kleur from "kleur";

// Define a mapping of log levels to their respective colors
const levelColorMap: Record<string, (text: string) => string> = {
  INFO: kleur.cyan,
  ERROR: kleur.red,
  WARN: kleur.yellow,
  DEBUG: kleur.green,
  DEFAULT: kleur.blue,
};

/**
 * Logs a message with a specific log level and formatting.
 * Automatically formats URLs when provided.
 * @param level The log level (e.g., INFO, ERROR, WARN, DEBUG).
 * @param message The message to log.
 * @param url Optional URL to highlight.
 */
export const logMessage = (
  level: keyof typeof levelColorMap = "DEFAULT",
  message: string,
  url?: string
): void => {
  // Ensure the level is in uppercase to match the keys in levelColorMap
  const normalizedLevel = level.toUpperCase() as keyof typeof levelColorMap;

  // Retrieve the corresponding color function, defaulting to "DEFAULT" if invalid
  const color = levelColorMap[normalizedLevel] || levelColorMap.DEFAULT;

  // Format the message and optional URL
  const formattedMessage = `${color(`[${normalizedLevel}]`)} ${kleur.grey(
    message
  )}`;
  const formattedUrl = url ? ` ${kleur.green().underline(url)}` : "";

  // Log the final output
  console.log(formattedMessage + formattedUrl);
};
