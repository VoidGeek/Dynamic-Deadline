interface Route {
  method: string;
  path: string;
}

const registeredRoutes: Route[] = [];

/**
 * Provides a centralized registry for managing routes.
 */
export const routeRegistry = {
  /**
   * Registers a route into the centralized registry.
   * @param method HTTP method (e.g., GET, POST, etc.).
   * @param path The route path (e.g., /api/tasks).
   */
  register(method: string, path: string): void {
    const isDuplicate = registeredRoutes.some(
      (route) => route.method === method && route.path === path
    );

    if (!isDuplicate) {
      registeredRoutes.push({ method: method.toUpperCase(), path });
    }
  },

  /**
   * Retrieves all registered routes.
   * @returns A list of all registered routes.
   */
  getAll(): Route[] {
    return registeredRoutes;
  },
};

export type { Route };
