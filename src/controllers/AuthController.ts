import fs from "fs";
import path from "path";

import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { SECRET } from "../config";

export class AuthController {
  private userService: UserService;
  private logger: Logger;
  constructor(userService: UserService, logger: Logger) {
    this.userService = userService;
    this.logger = logger;
  }

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug(`New user registration request`, {
      firstName,
      lastName,
      email,
    });

    try {
      const result = await this.userService.registerUser({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info(`User with ${result.id} registered successfully`);

      //Generate valid acces and refresh token
      const payload: JwtPayload = {
        sub: String(result.id),
        role: result.role,
      };

      let privateKey: Buffer;

      try {
        privateKey = fs.readFileSync(
          path.join(__dirname, "../../certs/private.pem")
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        const error = createHttpError(500, "Error while reading private key");
        next(error);
        return;
      }

      const accessToken = sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: "1h",
        issuer: "auth-service",
      });
      const refreshToken = sign(payload, SECRET as string, {
        algorithm: "HS256",
        expiresIn: "1y",
        issuer: "auth-service",
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict", //This will be sent to same site host
        maxAge: 1000 * 60 * 60, //1h
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict", //This will be sent to same site host
        maxAge: 1000 * 60 * 60 * 24 * 365, //1y
        httpOnly: true,
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
      return;
    }
  }
}
