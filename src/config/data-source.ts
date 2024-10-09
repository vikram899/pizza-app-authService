import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
  NODE_ENV,
} from ".";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: NODE_ENV === "test" || NODE_ENV === "dev",
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
