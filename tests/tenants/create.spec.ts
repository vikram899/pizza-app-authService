import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { App } from "supertest/types";
import { Tenant } from "../../src/entity/Tenant";

describe("GET /tenants", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return 201", async () => {
      const tenantData = {
        name: "Tenant Name",
        address: "Tenant Address",
      };

      const response = await request(app as unknown as App)
        .post("/tenants")
        .send(tenantData);
      expect(response.statusCode).toBe(201);
    });
    it("should create table in db", async () => {
      const tenantData = {
        name: "Tenant Name",
        address: "Tenant Address",
      };

      await request(app as unknown as App)
        .post("/tenants")
        .send(tenantData);

      const tenantRepository = await connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants[0].name).toBe(tenantData.name);
      expect(tenants[0].address).toBe(tenantData.address);
    });
  });
});
