import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  silent: process.env.ENVIROMENT !== " development",
  defaultMeta: { service: "user-service" },
  transports: [],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
