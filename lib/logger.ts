export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(context && Object.keys(context).length > 0 ? { context } : {}),
    };
    return JSON.stringify(entry);
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.format('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { error };
    console.error(this.format('error', message, { ...context, ...errorDetails }));
  }
}

export const logger = new Logger();
