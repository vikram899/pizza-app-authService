import { expressjwt } from "express-jwt";
import { Request } from "express";
import { REFRESH_TOKEN_SECRET } from "../config";
import { AuthCookie, IRefreshToken } from "../types";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import logger from "../config/logger";

export default expressjwt({
  secret: REFRESH_TOKEN_SECRET!,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken;
  },
  async isRevoked(request: Request, token) {
    try {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
      const refToken = await refreshTokenRepo.findOne({
        where: {
          id: Number((token?.payload as IRefreshToken).id),
          user: { id: Number(token?.payload.sub) },
        },
      });

      return refToken === null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      logger.error("Error while getting the refresh token", {
        id: (token?.payload as IRefreshToken).id,
      });
    }

    return true;
  },
});
