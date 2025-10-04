const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "..", "log.txt");

const logger = (req, res, next) => {
  const log = `${new Date().toISOString()} ${req.method} ${req.originalUrl}\n`;
  fs.appendFile(logFile, log, (err) => {
    if (err) console.error("Failed to write log:", err);
  });
  next();
};

module.exports = logger;
