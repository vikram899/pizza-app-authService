import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { PRIVATE_KEY, REFRESH_TOKEN_SECRET } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

  generateAccessToken(payload: JwtPayload) {
    let privateKey: string;

    if (!PRIVATE_KEY) {
      const error = createHttpError(500, "Private Key not assigned");
      throw error;
    }

    try {
      privateKey = PRIVATE_KEY;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const error = createHttpError(500, "Error while reading private key");
      throw error;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1d",
      issuer: "auth-service",
    });

    return accessToken;
  }
  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, REFRESH_TOKEN_SECRET as string, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(payload.id),
    });

    return refreshToken;
  }
  async persistRefreshToken(userResult: User) {
    const MS_IN_YEARS = 1000 * 60 * 60 * 24 * 365;

    const newRefToken = await this.refreshTokenRepository.save({
      user: userResult,
      expiresAt: new Date(Date.now() + MS_IN_YEARS),
    });

    return newRefToken;
  }

  async deleteRefreshToken(tokenId: number) {
    return await this.refreshTokenRepository.delete({ id: tokenId });
  }
}
