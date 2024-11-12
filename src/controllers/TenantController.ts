import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class TenantController {
  constructor(private tenantService: TenantService, private logger: Logger) {}

  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const { name, address } = req.body;

    this.logger.debug("Request for creating the tenant", { name, address });

    try {
      const tenant = await this.tenantService.create({ name, address });

      this.logger.info("Tenant has been created", { id: tenant.id });
      res.status(201).json(tenant);
    } catch (err) {
      next(err);
    }
  }

  async fetch(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantService.fetch();
      res.status(200).json({ tenants });
    } catch (error) {
      next(error);
    }
  }

  async fetchById(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    if (isNaN(Number(id))) {
      const error = createHttpError(400, "Invalid tennant id");
      next(error);
      return;
    }

    this.logger.info(`Tenant with id: ${id} is being fetched`);
    try {
      const tenant = await this.tenantService.fetchById({ id });
      res.status(200).json({ tenant });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    const { name, address } = req.body;

    if (isNaN(Number(id))) {
      const error = createHttpError(400, "Invalid tennant id");
      next(error);
      return;
    }

    try {
      await this.tenantService.update(id, { name, address });
      this.logger.info(`Tenant with id: ${id} updated`, req.body);
      res.status(200).json({ id });
    } catch (error) {
      next(error);
    }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    if (isNaN(Number(id))) {
      const error = createHttpError(400, "Invalid tennant id");
      next(error);
      return;
    }

    try {
      await this.tenantService.delete(id);
      this.logger.info(`Tenant with id: ${id} deleted`, req.body);
      res.status(200).json({ id });
    } catch (error) {
      next(error);
    }
  }
}
