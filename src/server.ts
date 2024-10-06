import app from "./app";
import { PORT } from "./config";
import logger from "./config/logger";

const startServer = async () => {
  try {
    app.listen(PORT, () =>
      logger.info(`Test Server is running on port ${PORT}`)
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
      setTimeout(() => process.exit(1), 1000);
    }
  }
};

startServer();
