import dotenv from "dotenv";
dotenv.config();

import config from "./config/config";
import "./app";

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // close server
  config.stopApp().finally(() => {
    process.exit(1);
  });
});

// stert server
config.runApp();

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  config.stopApp().finally(() => {
    process.exit(1);
  });
});
