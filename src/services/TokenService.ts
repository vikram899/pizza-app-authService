import { JwtPayload, sign } from "jsonwebtoken";
import fs from "fs";
import createHttpError from "http-errors";
import path from "path";
import { SECRET } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;

    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, "../../certs/private.pem")
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const error = createHttpError(500, "Error while reading private key");
      throw error;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "auth-service",
    });

    return accessToken;
  }
  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, SECRET as string, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(payload.id),
    });

    return refreshToken;
  }
  async persistRefreshToken(userResult: User) {
    const MS_IN_YEARS = 1000 * 60 * 60 * 24 * 365;
    //const refreshTokenRepository =   AppDataSource.getRepository(RefreshToken);
    const newRefToken = await this.refreshTokenRepository.save({
      user: userResult,
      expiresAt: new Date(Date.now() + MS_IN_YEARS),
    });

    return newRefToken;
  }
}
