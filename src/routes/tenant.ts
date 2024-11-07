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

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
  "/",
  authenticate as RequestHandler,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next)
);

export default router;
