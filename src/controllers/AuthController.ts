import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";

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
      res.status(201).json(result);
    } catch (err) {
      next(err);
      return;
    }
  }
}
