import pino from "pino";

/**
 * Pino logger instance configured for the application.
 *
 * In development mode, uses pino-pretty for formatted output.
 * In production mode, outputs structured JSON logs.
 *
 * Usage:
 * ```ts
 * import { logger } from '@/lib/logger';
 *
 * logger.info('Something happened');
 * logger.error({ err }, 'Error occurred');
 * logger.debug({ userId: 123 }, 'User details');
 * ```
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(process.env.NODE_ENV === "production"
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "SYS:standard",
          },
        },
      }),
});
