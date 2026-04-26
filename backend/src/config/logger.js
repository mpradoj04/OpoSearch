const { createLogger, format, transports } = require("winston");
const path = require("path");

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "http" : "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json(),
  ),
  defaultMeta: { service: "oposearch-backend" },
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({
      filename: path.join(__dirname, "../../logs/app.log"),
    }),
    new transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
    }),
  ],
});

logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
