interface Route {
  method: string;
  path: string;
}

const registeredRoutes: Route[] = [];

/**
 * Registers a route into the centralized registry.
 * @param method HTTP method (e.g., GET, POST, etc.).
 * @param path The route path (e.g., /api/tasks).
 */
export const registerRoute = (method: string, path: string): void => {
  // Check for duplicate routes to avoid redundancy
  const isDuplicate = registeredRoutes.some(
    (route) => route.method === method && route.path === path
  );

  if (!isDuplicate) {
    registeredRoutes.push({ method: method.toUpperCase(), path });
  }
};

/**
 * Retrieves all registered routes.
 * @returns A list of all registered routes.
 */
export const getRegisteredRoutes = (): Route[] => {
  return registeredRoutes;
};
