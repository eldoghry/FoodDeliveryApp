import { Router } from "express";
import { MasterController } from "../controllers";

export function setupMasterRoutes(controller: MasterController) {
  const router = Router();

  router.get("/health", controller.checkHealth.bind(controller));
  return router;
}
