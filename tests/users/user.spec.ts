import request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import createJWKSMock from "mock-jwks";

describe("GET /auth/self", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(async () => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return the 200 status code", async () => {
      const accessToken = jwks.token({
        sub: "1",
        role: Roles.CUSTOMER,
      });

      const response = await request(app as unknown as App)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      expect(response.statusCode).toBe(200);
    });

    it("should return user data", async () => {
      //Register user in DB

      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "jhondoe@gmail.com",
        password: "password",
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      //Genertae dummy token and verify using dummy public key
      const accessToken = jwks.token({ sub: data.id, role: data.role });
      //Add token in cookieF
      const response = await request(app as unknown as App)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      expect((response.body as Record<string, string>).id).toBe(data.id);
    });

    it("should not written password", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "jhondoe@gmail.com",
        password: "password",
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      //Genertae dummy token and verify using dummy public key
      const accessToken = jwks.token({ sub: data.id, role: data.role });
      //Add token in cookieF
      const response = await request(app as unknown as App)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      expect(response.body as Record<string, string>).not.toHaveProperty(
        "password"
      );
    });
  });
});
