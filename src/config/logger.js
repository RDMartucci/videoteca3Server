//./src/config/logger.js

/************************************************************************************************* */
// Logger Configuration
/************************************************************************************************* */
// This module sets up a logger using the Winston library for consistent logging across the application.
// It configures the logger to include timestamps and colorized output for better readability in the console.
// It exports the configured logger for use in other parts of the application.
///************************************************************************************************* */

import winston from 'winston';

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

export default logger;