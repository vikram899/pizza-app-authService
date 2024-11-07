import { Repository } from "typeorm";
import { ITenant } from "../types";
import { Tenant } from "../entity/Tenant";
import createHttpError from "http-errors";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  async create({ name, address }: ITenant) {
    try {
      return await this.tenantRepository.save({ name, address });
    } catch (err) {
      const error = createHttpError(500, "Failed to store data in DB");
      throw error;
      throw err;
    }
  }
}
