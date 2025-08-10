// Structured logging for production monitoring
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private formatLog(entry: LogEntry): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[entry.level];
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error ? `\nError: ${entry.error.stack}` : '';
    
    return `[${timestamp}] ${levelStr}: ${entry.message}${contextStr}${errorStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.FATAL:
        console.error(`🚨 FATAL: ${formattedLog}`);
        break;
    }

    // In production, you might want to send logs to external services
    if (this.isProduction && level >= LogLevel.ERROR) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // TODO: Implement external logging service (e.g., Sentry, LogRocket, etc.)
    // For now, just log to console
    if (process.env.NODE_ENV === 'production') {
      console.error('External logging not implemented:', entry);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.FATAL, message, context, error);
  }

  // Convenience methods for common operations
  orderCreated(orderId: string, tableNumber: string, itemsCount: number) {
    this.info('Order created', { orderId, tableNumber, itemsCount });
  }

  orderUpdated(orderId: string, status: string, previousStatus?: string) {
    this.info('Order updated', { orderId, status, previousStatus });
  }

  adminLogin(username: string, role: string, success: boolean) {
    this.info('Admin login attempt', { username, role, success });
  }

  webhookSent(webhookUrl: string, success: boolean, statusCode?: number) {
    this.info('Webhook sent', { webhookUrl, success, statusCode });
  }

  databaseOperation(operation: string, collection: string, success: boolean, duration?: number) {
    this.info('Database operation', { operation, collection, success, duration });
  }
}

export const logger = new Logger();
export default logger;
