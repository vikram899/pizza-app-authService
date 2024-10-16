import request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import { isJwt } from "../utils";

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
    it("should return 400 for duplicate email", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "jhondoe@gmail.com",
        password: "password",
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });

      //Act
      const response = await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      //Assert
      const users = await userRepository.find();
      expect(response.status).toBe(400);
      expect(users).toHaveLength(1);
    });
    it("should return access token and refresh toke inside cookie", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "password",
      };

      //Act
      const response = await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      interface Headers {
        ["set-cookie"]: string[];
      }
      //Assert
      let accessToken: string = "";
      let refreshToken: string = "";
      const cookies =
        (response.headers as unknown as Headers)["set-cookie"] || [];
      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }
        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken).not.toEqual("");
      expect(refreshToken).not.toEqual("");
      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });
  });

  describe("Fields are missing", () => {
    it("should return 400 for missing email", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "",
        password: "password",
      };

      //Act
      const response = await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      //Assert
      expect(response.status).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it("should return 400 for missing password", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: " johndoe@gmail.com ",
        password: "",
      };

      //Act
      const response = await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      expect(response.status).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it("should return 400 for missing first Name", async () => {
      //Arrange
      const userData = {
        firstName: "",
        lastName: "Doe",
        email: " johndoe@gmail.com ",
        password: "password",
      };

      //Act
      const response = await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      expect(response.status).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it("should return 400 for missing last Name", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "",
        email: " johndoe@gmail.com ",
        password: "password",
      };

      //Act
      const response = await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      expect(response.status).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });

  describe("Fields are not in proper format", () => {
    it("should trim the email field", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: " johndoe@gmail.com ",
        password: "password",
      };

      //Act
      await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].email).toBe("johndoe@gmail.com");
    });
    it("should be a valid email", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail",
        password: "password",
      };

      //Act
      const response = await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      //Assert
      expect(response.status).toBe(400);
    });
    it("should have password length between 6 and 15", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail",
        password: "paword",
      };

      //Act
      const response = await request(app as unknown as App)
        .post("/auth/register")
        .send(userData);

      //Assert
      expect(response.status).toBe(400);
    });
  });
});
