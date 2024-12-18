import { expressjwt } from "express-jwt";
import { Request } from "express";
import { REFRESH_TOKEN_SECRET } from "../config";
import { AuthCookie } from "../types";

export default expressjwt({
  secret: REFRESH_TOKEN_SECRET!,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken;
  },
});
