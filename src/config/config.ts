import express, { Application } from "express";
import { Server } from "http";
import { resolve } from "path";

class Config {
  private readonly PORT: number = Number(process.env.PORT) || 3000;
  private readonly app: Application = express();
  private static instance: Config | null = null;
  private server: Server | null = null;

  constructor() {}

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public getApp(): Application {
    return this.app;
  }

  public getPort(): Number {
    return this.PORT;
  }

  private listenAsync(): Promise<Server> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.PORT, () => {
          resolve(this.server as Server);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public async runApp(): Promise<void> {
    try {
      await this.listenAsync();
      console.log(`Server is running on port ${this.PORT}`);
    } catch (err) {
      console.error(`Error running the application:`, err);
      process.exit(1);
    }
  }

  public async stopApp(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve, reject) => {
        this.server?.close((err) => {
          if (err) reject(err);
          resolve();
        });
      });
    }
  }
}

export default Config.getInstance();
