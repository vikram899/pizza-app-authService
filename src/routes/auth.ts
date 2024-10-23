import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidators from "../validators/register-validators";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidators from "../validators/login-validators";
import { CredentialService } from "../services/CredentialService";
import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "../types";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import parseRefreshToken from "../middlewares/parseRefreshToken";

const authRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialService
);

authRouter.post(
  "/register",
  registerValidators,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next)
);

authRouter.post(
  "/login",
  loginValidators,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next)
);

authRouter.get(
  "/self",
  authenticate as RequestHandler,
  (req: Request, res: Response) => authController.self(req as AuthRequest, res)
);

authRouter.post(
  "/refresh",
  validateRefreshToken as RequestHandler,
  (req: Request, res: Response, next: NextFunction) =>
    authController.refresh(req as AuthRequest, res, next)
);

authRouter.post(
  "/logout",
  authenticate as RequestHandler,
  parseRefreshToken as RequestHandler,
  (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req as AuthRequest, res, next)
);

export default authRouter;
