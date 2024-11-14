import { NextFunction, Response } from "express";
import { UserService } from "../services/UserService";
import { CreateUserRequest, UpdateUserRequest } from "../types";
import createHttpError from "http-errors";

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password, tenantId, role } = req.body;
    try {
      const userResult = await this.userService.registerUser({
        firstName,
        lastName,
        email,
        password,
        tenantId,
        role,
      });

      res.status(201).json(userResult);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      const usersResult = await this.userService.findAllUser();

      res.status(201).json(usersResult);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: CreateUserRequest, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    if (isNaN(Number(id))) {
      const error = createHttpError(400, "Invalid user id");
      next(error);
      return;
    }
    try {
      const usersResult = await this.userService.findUserbyId(Number(id));

      res.status(201).json(usersResult);
    } catch (error) {
      next(error);
    }
  }

  async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    const { firstName, lastName, email, role, tenantId } = req.body;

    if (isNaN(Number(id))) {
      const error = createHttpError(400, "Invalid user id");
      next(error);
      return;
    }
    try {
      const usersResult = await this.userService.update(Number(id), {
        firstName,
        lastName,
        email,
        role,
        tenantId,
      });

      res.status(201).json(usersResult);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: CreateUserRequest, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    if (isNaN(Number(id))) {
      const error = createHttpError(400, "Invalid user id");
      next(error);
      return;
    }
    try {
      const usersResult = await this.userService.delete(Number(id));

      res.status(201).json(usersResult);
    } catch (error) {
      next(error);
    }
  }
}
