import request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { truncateTable } from "../utils";
import { User } from "../../src/entity/User";
import app from "../../src/app";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await truncateTable(connection);
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
    });
  });
  describe("Fields are missing", () => {});
});
