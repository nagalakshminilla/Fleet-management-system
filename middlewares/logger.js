const fs = require('fs');
const path = require('path');

const logger = (req, res, next) => {
  const logEntry = {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress
  };
  
  const logString = `${logEntry.timestamp} - ${logEntry.method} ${logEntry.url} - IP: ${logEntry.ip}\n`;
  
  // Append to logs.txt file
  fs.appendFile(path.join(__dirname, '../logs.txt'), logString, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
  
  next();
};

module.exports = logger;