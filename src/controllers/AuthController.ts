import { NextFunction, Response } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { User } from "../entity/User";
import { Roles } from "../constants";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private crendentialService: CredentialService
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    //Validating the request body
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
      //Register user and save in DB
      const userResult = await this.userService.registerUser({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER,
      });

      this.logger.info(`User with ${userResult.id} registered successfully`);

      //Generate valid access and refresh token
      const payload: JwtPayload = {
        sub: String(userResult.id),
        role: userResult.role,
      };

      //Persisting the ref token in DB
      const newRefToken = await this.tokenService.persistRefreshToken(
        userResult
      );

      //Generate access token
      const accessToken = this.tokenService.generateAccessToken(payload);

      //Generate refresh token
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefToken.id),
      });

      //Setting access and ref token in cookie
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

      res.status(201).json(userResult);
    } catch (err) {
      next(err);
      return;
    }
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    //Validating the request body
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    const { email, password } = req.body;

    this.logger.debug(`New, User log in request`, {
      email,
      password: "******",
    });

    //Check if email exists in DB
    const user: User | null = await this.userService.findUserByEmail(email);

    if (!user) {
      const error = createHttpError(400, "Email or password does not match");
      next(error);
      return;
    }
    //Compare password

    const passwordMatch: boolean =
      await this.crendentialService.comparePassword(password, user.password);

    if (!passwordMatch) {
      const error = createHttpError(400, "Email or password does not match");
      next(error);
      return;
    }
    //Generate tokens

    //Generate valid access and refresh token
    const payload: JwtPayload = {
      sub: String(user.id),
      role: user.role,
    };

    //Persisting the ref token in DB
    const newRefToken = await this.tokenService.persistRefreshToken(user);

    //Generate access token
    const accessToken = this.tokenService.generateAccessToken(payload);

    //Generate refresh token
    const refreshToken = this.tokenService.generateRefreshToken({
      ...payload,
      id: String(newRefToken.id),
    });

    //Setting access and ref token in cookie
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
    this.logger.info(`User with user id: ${user.id} has been looged in`);
    res.status(200).json(user);
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findUserById(Number(req.auth.sub));
    res.json({ ...user, password: undefined });
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      //Generate valid access and refresh token
      const { sub, role, id } = req.auth;
      const payload: JwtPayload = {
        sub: sub,
        role: role,
      };

      const userResult = await this.userService.findUserById(Number(sub));

      if (!userResult) {
        const error = createHttpError(400, "User does not exists");
        next(error);
        return;
      }
      //Generate access token
      const accessToken = this.tokenService.generateAccessToken(payload);

      //Persisting the ref token in DB
      const newRefToken = await this.tokenService.persistRefreshToken(
        userResult
      );

      this.logger.info(
        `New access toke ${accessToken} and refreshToken ${newRefToken} generated`
      );

      //Delete the token from Db
      await this.tokenService.deleteRefreshToken(Number(id));

      //Generate refresh token
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefToken.id),
      });

      //Setting access and ref token in cookie
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

      res.status(201).json(userResult);
    } catch (error) {
      next(error);
      return;
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sub, id } = req.auth;
      await this.tokenService.deleteRefreshToken(Number(id));
      this.logger.info("Refresh token has been deleted", {
        id: id,
      });
      this.logger.info("User has been logged out", { id: sub });

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json({});
    } catch (err) {
      next(err);
      return;
    }
  }
}
