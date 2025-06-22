// Centralized logging utility for production monitoring
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private isProduction = import.meta.env.PROD;

  private log(level: LogLevel, message: string, context?: Record<string, any>, userId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId
    };

    // In production, send to external logging service
    if (this.isProduction) {
      // Send to your logging service (e.g., Sentry, LogRocket, etc.)
      this.sendToLoggingService(entry);
    } else {
      // In development, use console
      console[level](message, context);
    }
  }

  private sendToLoggingService(entry: LogEntry) {
    // Implement your logging service integration here
    // Example: Sentry, LogRocket, or custom endpoint
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(err => console.error('Failed to send log:', err));
  }

  debug(message: string, context?: Record<string, any>, userId?: string) {
    this.log(LogLevel.DEBUG, message, context, userId);
  }

  info(message: string, context?: Record<string, any>, userId?: string) {
    this.log(LogLevel.INFO, message, context, userId);
  }

  warn(message: string, context?: Record<string, any>, userId?: string) {
    this.log(LogLevel.WARN, message, context, userId);
  }

  error(message: string, context?: Record<string, any>, userId?: string) {
    this.log(LogLevel.ERROR, message, context, userId);
  }
}

export const logger = new Logger(); 