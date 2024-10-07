import express, { NextFunction } from "express";
import logger from "./config/logger";
import { Request, Response } from "express";
import { HttpError } from "http-errors";

const app = express();

app.get("/", async (req, res) => {
  res.send("Welcome to express with TypeScript with docker");
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        message: err.message,
        path: "",
        location: "",
      },
    ],
  });
});

export default app;
