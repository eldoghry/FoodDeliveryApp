import { Router } from "express";
import { UserController } from "../controllers/user.controller";

export function setupUserRoutes(controller: UserController): Router {
  const router = Router();

  router.post("/user", controller.create.bind(controller));
  router.get("/user", controller.getAll.bind(controller));
  // TODO: add more routes

  return router;
}
