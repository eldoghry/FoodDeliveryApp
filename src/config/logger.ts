import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    // winston.format.json()
    winston.format.simple()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({
      filename: 'logs/combine.log',
    }),
    new winston.transports.Console(),
  ],
});

export default logger;
