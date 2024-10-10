import request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import app from "../../src/app";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {
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
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "jhondoe@gmail.com",
        password: "password",
      };

      //Act
      const response = await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      //Assert
      expect(response.status).toBe(201);
    });
    it("should return valid json response", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "jhondoe@gmail.com",
        password: "password",
      };

      //Act
      const response = await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      //Assert
      expect(
        (response.headers as Record<string, string>)["content-type"]
      ).toEqual(expect.stringContaining("json"));
    });
    it("should persist user in the db", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "jhondoe@gmail.com",
        password: "password",
      };

      //Act
      await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });
    it("should return id field of created user", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "jhondoe@gmail.com",
        password: "password",
      };

      //Act
      const response = await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      //Assert
      expect(response.body).toHaveProperty("id");
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(response.body.id).toBe(users[0].id);
    });
    it("should assign a customer role", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "jhondoe@gmail.com",
        password: "password",
      };

      //Act
      await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });
    it("should stored hased password in DB", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "jhondoe@gmail.com",
        password: "password",
      };

      //Act
      await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });
  });
  describe("Fields are missing", () => {});
});
