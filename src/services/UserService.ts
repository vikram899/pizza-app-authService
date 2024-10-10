import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles, SALT_ROUNDS } from "../constants";
import bcrypt from "bcrypt";

export class UserService {
  private userRepository: Repository<User>;
  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }

  async registerUser({ firstName, lastName, email, password }: UserData) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const error = createHttpError(400, "Email already exists");
      throw error;
    }
    //Hash the passwrord
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });
    } catch (err) {
      const error = createHttpError(500, "Failed to store data in DB");
      throw error;
      throw err;
    }
  }
}
