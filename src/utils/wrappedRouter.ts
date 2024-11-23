import { Router } from "express";
import { registerRoute } from "./routeRegistry";

/**
 * Creates a wrapped Router that automatically registers routes.
 * @returns A wrapped Router instance.
 */
export const createRouter = (): Router => {
  const router = Router();

  // Wrap each HTTP method
  const methods = ["get", "post", "put", "patch", "delete"] as const;

  methods.forEach((method) => {
    // Explicitly cast the method to ensure TypeScript recognizes `bind`
    const originalMethod = (router[method] as any).bind(router);

    // Override the method to include route registration
    (router as any)[method] = (path: string, ...handlers: any[]) => {
      // Register the route in the centralized registry
      registerRoute(method.toUpperCase(), path);

      // Call the original Router method to define the route
      return originalMethod(path, ...handlers);
    };
  });

  return router;
};
