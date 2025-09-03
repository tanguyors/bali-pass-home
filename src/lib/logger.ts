type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message), data ? data : '');
    }
  }

  info(message: string, data?: any): void {
    console.info(this.formatMessage('info', message), data ? data : '');
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage('warn', message), data ? data : '');
  }

  error(message: string, data?: any): void {
    console.error(this.formatMessage('error', message), data ? data : '');
  }

  // Méthode spéciale pour les erreurs 404 et autres erreurs importantes
  critical(message: string, data?: any): void {
    console.error(this.formatMessage('error', `CRITICAL: ${message}`), data ? data : '');
  }
}

export const logger = new Logger();