import app from "./app";
import { PORT } from "./config";

const startServer = async () => {
  try {
    app.listen(PORT, () =>
      // eslint-disable-next-line no-console
      console.log(`Test Server is running on port ${PORT}`)
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
};

startServer();
