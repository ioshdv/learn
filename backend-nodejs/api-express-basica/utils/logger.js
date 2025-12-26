const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, 'operaciones.log');

const logger = {
  info: (mensaje) => {
    const log = `[${new Date().toISOString()}] INFO: ${mensaje}\n`;
    fs.appendFileSync(logFile, log);
    console.log(log.trim());
  },
  error: (mensaje) => {
    const log = `[${new Date().toISOString()}] ERROR: ${mensaje}\n`;
    fs.appendFileSync(logFile, log);
    console.error(log.trim());
  }
};

module.exports = logger;