import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { UserController } from "../controllers/UserController";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import authenticate from "../middlewares/authenticate";

const userRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);
userRouter.post(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next)
);

export default userRouter;
