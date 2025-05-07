import winston from 'winston';

const consoleFormat = winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
  const msg = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;

  const extra = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';

  return `${timestamp} [${level}]: ${stack || msg}${extra}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // show error stack
    winston.format.json(),
    winston.format.prettyPrint()
    // winston.format.simple()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      //  format: winston.format.json()
    }),
    new winston.transports.File({
      filename: 'logs/combine.log',
      // format: winston.format.json(),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.errors({ stack: true }),
        winston.format.json(), // JSON in console
        consoleFormat
      ),
    }),
  ],
});

export default logger;
