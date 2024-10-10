import { describe } from "node:test";
import { App } from "supertest/types";
import request from "supertest";
import app from "./src/app";

describe("App", () => {
  it("should return 200 status", async () => {
    const response = await request(app as unknown as App)
      .get("/")
      .send();
    expect(response.status).toBe(200);
  });
});
