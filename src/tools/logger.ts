import winston from 'winston';

export default winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  exitOnError: false,
  handleExceptions: true,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.printf((obj) =>
      winston.format
        .colorize()
        .colorize(
          obj.level,
          `[${obj.timestamp} ${obj.level.toUpperCase()}]: ${obj.message}`
        )
    )
  ),
  transports: [new winston.transports.Console()],
});
