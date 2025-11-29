import debug from 'debug';
import chalk from 'chalk';

const namespace = 'dproc:cli';

export class Logger {
  private debugLogger: debug.Debugger;

  constructor(private prefix: string) {
    this.debugLogger = debug(`${namespace}:${prefix}`);
  }

  info(message: string, ...args: any[]) {
    console.log(chalk.blue('ℹ'), message, ...args);
    this.debugLogger('info: %s', message, ...args);
  }

  success(message: string, ...args: any[]) {
    console.log(chalk.green('✔'), message, ...args);
    this.debugLogger('success: %s', message, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(chalk.red('✖'), message, ...args);
    this.debugLogger('error: %s', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(chalk.yellow('⚠'), message, ...args);
    this.debugLogger('warn: %s', message, ...args);
  }

  log(message: string, ...args: any[]) {
    this.debugLogger(message, ...args);
  }
}

export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}