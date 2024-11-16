import bcrypt from "bcryptjs";
export class CredentialService {
  async comparePassword(userPassword: string, dbPassword: string) {
    return bcrypt.compare(userPassword, dbPassword);
  }
}
