import { NextFunction, Response } from "express";
import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../types";
import { Roles } from "../constants";

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body;
    try {
      const userResult = await this.userService.registerUser({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER,
      });

      res.status(201).json(userResult);
    } catch (error) {
      next(error);
    }
  }
}
