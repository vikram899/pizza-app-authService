import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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
      const response = await request(app).post("/auth/register").send(userData);

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
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(
        (response.headers as Record<string, string>)["content-type"]
      ).toEqual(expect.stringContaining("json"));
    });
  });
  describe("Fields are missing", () => {});
});
