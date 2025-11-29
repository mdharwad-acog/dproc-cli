import ora, { type Ora } from 'ora';

export class Spinner {
  private spinner: Ora;

  constructor(text: string) {
    this.spinner = ora({
      text,
      color: 'cyan',
      spinner: 'dots',
    });
  }

  start(text?: string) {
    if (text) this.spinner.text = text;
    this.spinner.start();
  }

  succeed(text?: string) {
    this.spinner.succeed(text || this.spinner.text);
  }

  fail(text?: string) {
    this.spinner.fail(text || this.spinner.text);
  }

  warn(text?: string) {
    this.spinner.warn(text || this.spinner.text);
  }

  info(text?: string) {
    this.spinner.info(text || this.spinner.text);
  }

  update(text: string) {
    this.spinner.text = text;
  }

  stop() {
    this.spinner.stop();
  }
}

export function createSpinner(text: string): Spinner {
  return new Spinner(text);
}