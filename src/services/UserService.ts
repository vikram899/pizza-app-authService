import { Repository } from "typeorm";
import { User } from "../entity/User";
import { LimitedUserData, UserData } from "../types";
import createHttpError from "http-errors";
import { SALT_ROUNDS } from "../constants";
import bcrypt from "bcryptjs";

export class UserService {
  private userRepository: Repository<User>;
  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }

  async registerUser({
    firstName,
    lastName,
    email,
    password,
    tenantId,
    role,
  }: UserData) {
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
        tenantId: tenantId ? { id: tenantId } : undefined,
        role,
      });
    } catch (err) {
      const error = createHttpError(500, "Failed to store data in DB");
      throw error;
      throw err;
    }
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      select: ["id", "email", "firstName", "lastName", "password", "role"],
    });
    return user;
  }

  async findUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    return user;
  }

  async findAllUser() {
    const users = await this.userRepository.find();
    return users;
  }

  async findUserbyId(id: number) {
    const user = await this.userRepository.find({
      where: {
        id,
      },
    });
    return user;
  }

  async update(id: number, UserData: LimitedUserData) {
    const user = await this.userRepository.update(id, UserData);
    return user;
  }

  async delete(id: number) {
    const user = await this.userRepository.delete(id);
    return user;
  }
}
