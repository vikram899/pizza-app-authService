import winston from "winston";
import { NODE_ENV } from ".";

const logger = winston.createLogger({
  level: "info",
  defaultMeta: {
    serviceName: "auth-service",
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      level: "info",
      silent: NODE_ENV === "test",
    }),
    new winston.transports.File({
      dirname: "logs",
      filename: "error.log",
      level: "error",
      silent: NODE_ENV === "test",
    }),
    new winston.transports.File({
      dirname: "logs",
      filename: "combined.log",
      level: "info",
      silent: NODE_ENV === "test",
    }),
  ],
});

export default logger;
