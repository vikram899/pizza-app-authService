import app from "./app";
import { PORT } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("Database connected successfully");
    app.listen(PORT, () =>
      logger.info(`Server from docker is running on port ${PORT}`)
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
      setTimeout(() => process.exit(1), 1000);
    }
  }
};

startServer();
