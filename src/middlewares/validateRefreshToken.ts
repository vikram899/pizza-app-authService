import { expressjwt } from "express-jwt";
import { Request } from "express";
import { SECRET } from "../config";
import { AuthCookie } from "../types";

export default expressjwt({
  secret: SECRET!,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.split(" ")[1] !== "undefined") {
      const token = authHeader.split(" ")[1];
      if (token) {
        return token;
      }
    }
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken;
  },
});
