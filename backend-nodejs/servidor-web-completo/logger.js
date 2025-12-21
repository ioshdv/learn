const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'logs', 'access.log');

module.exports = (msg) => {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFile(logFile, line, (err) => {
        if (err) console.error('Error log');
    });
};