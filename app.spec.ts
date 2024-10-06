import { describe } from "node:test";
import { calcDiscount } from "./src/utils";
import request from "supertest";
import app from "./src/app";

describe("App", () => {
  it("should calculate discount", () => {
    const result = calcDiscount(100, 10);
    expect(result).toBe(10);
  });

  it("should return 200 status", async () => {
    const response = await request(app).get("/").send();
    expect(response.status).toBe(200);
  });
});
