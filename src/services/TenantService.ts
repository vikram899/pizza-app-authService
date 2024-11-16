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

  async fetch() {
    try {
      return await this.tenantRepository.find();
    } catch (err) {
      const error = createHttpError(500, "failed to fetch");
      throw error;
      throw err;
    }
  }

  async fetchById({ id }: { id: string }) {
    try {
      return await this.tenantRepository.findOne({
        where: {
          id: Number(id),
        },
      });
    } catch (err) {
      const error = createHttpError(500, "failed to fetch");
      throw error;
      throw err;
    }
  }

  async update(id: string, tenantData: ITenant) {
    try {
      await this.tenantRepository.update(Number(id), tenantData);
    } catch (err) {
      const error = createHttpError(500, "Failed to update");
      throw error;
      throw err;
    }
  }

  async delete(id: string) {
    try {
      await this.tenantRepository.delete(Number(id));
    } catch (err) {
      const error = createHttpError(500, "Failed to delete");
      throw error;
      throw err;
    }
  }
}
