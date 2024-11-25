import express from "express";
import { handleWebhook } from "../controllers/webhookController";

const router = express.Router();

// Wrap the async handler
const asyncHandler =
  (fn: any) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };

// Use the async handler for your route
router.post("/", asyncHandler(handleWebhook));

export { router as webhookRouter };
