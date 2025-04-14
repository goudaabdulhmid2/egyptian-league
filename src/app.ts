import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";

import config from "./config/config";
import errorHandler from "./middleware/errorHandler";
import ApiError from "./utils/apiError";
import teamRouter from "./routes/teamRouter";
import playerRouter from "./routes/playerRouter";

const app = config.getApp();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/players", playerRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(
    new ApiError(`Can't find this route ${req.originalUrl}`, 400, "fail", true)
  );
});
// Global error handling middleware
app.use(errorHandler);
