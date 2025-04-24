import express, { Router } from "express";
import { TypeormUserRepository } from "./infrastructure/repositories";
import { CreateUserUseCase } from "./application/user";
import {
  MasterController,
  UserController,
} from "./infrastructure/express/controllers";
import { setupUserRoutes } from "./infrastructure/express/routes";
import { setupMasterRoutes } from "./infrastructure/express/routes/master.routes";
import { unknownHandler } from "./infrastructure/express/middlewares/unknown-handler.middleware";
import { ErrorHandler } from "./infrastructure/express/middlewares/error-handler.middleware";

async function startServer() {
  // Initialize repositories
  const userRepository = new TypeormUserRepository(); // here I can define which repository to use

  // Initialize application services
  const createUserUseCase = new CreateUserUseCase(userRepository);

  // Initialize controllers
  const userController = new UserController(createUserUseCase);
  const masterController = new MasterController();

  // Setup Express app
  const app = express();
  const PORT = 3000;

  // Setup middlewares
  app.use(express.json()); // for parsing application/json

  // Setup routes
  const apiRouter = Router();
  app.use("/api/v1", apiRouter);

  apiRouter.use(setupMasterRoutes(masterController));
  apiRouter.use(setupUserRoutes(userController));

  app.use(unknownHandler);
  app.use(new ErrorHandler().handleError);

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
