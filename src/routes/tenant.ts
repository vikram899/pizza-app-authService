import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { TenantController } from "../controllers/TenantController";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import { TenantService } from "../services/TenantService";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next)
);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  tenantController.fetch(req, res, next);
});

router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  tenantController.fetchById(req, res, next);
});

router.patch(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => {
    tenantController.update(req, res, next);
  }
);

router.delete(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => {
    tenantController.delete(req, res, next);
  }
);

export default router;
