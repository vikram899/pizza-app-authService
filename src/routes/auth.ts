import express, { Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidators from "../validators/register-validators";

const authRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);

authRouter.post(
  "/register",
  registerValidators,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next)
);

export default authRouter;
