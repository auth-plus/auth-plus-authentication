import winston from "winston";
import env from "./env";
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: new winston.transports.File({ filename: "3t.log" })
});

if (env.app.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}

export default logger;
