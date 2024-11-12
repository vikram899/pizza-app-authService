import request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import createJWKSMock from "mock-jwks";

describe("POST /users", () => {
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
    it("It should persist user in DB", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "jhondoe@gmail.com",
        password: "password",
        tenantId: 1,
      };
      const adminAccessToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });

      const response = await request(app as unknown as App)
        .post("/users")
        .set("Cookie", [`accessToken=${adminAccessToken}`])
        .send(userData);

      const userRepository = await connection.getRepository(User);
      const users = await userRepository.find();

      expect(response.status).toBe(201);
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });
    it("should create a manager user", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "jhondoe@gmail.com",
        password: "password",
        tenantId: 1,
      };
      const adminAccessToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });

      await request(app as unknown as App)
        .post("/users")
        .set("Cookie", [`accessToken=${adminAccessToken}`])
        .send(userData);

      const userRepository = await connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.MANAGER);
    });
    it.todo("It should return 403 if non Admin tries to create a user");
  });
});
