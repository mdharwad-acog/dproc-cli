import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';

export class Display {
  static banner() {
    const text = `
${chalk.cyan.bold('dproc CLI')}
${chalk.gray('AI-powered data processing')}
    `;

    console.log(
      boxen(text, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
      })
    );
  }

  static welcome(message: string) {
    console.log(
      boxen(message, {
        padding: 1,
        margin: { top: 1, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: 'green',
      })
    );
  }

  static section(title: string) {
    console.log('\n' + chalk.bold.underline(title) + '\n');
  }

  static table(head: string[], rows: string[][]) {
    const table = new Table({
      head: head.map((h) => chalk.cyan.bold(h)),
      style: {
        head: [],
        border: ['gray'],
      },
    });

    rows.forEach((row) => table.push(row));
    console.log(table.toString());
  }

  static keyValue(pairs: Record<string, any>) {
    const maxKeyLength = Math.max(...Object.keys(pairs).map((k) => k.length));
    
    Object.entries(pairs).forEach(([key, value]) => {
      const paddedKey = key.padEnd(maxKeyLength + 2);
      console.log(chalk.cyan(paddedKey), chalk.white(value));
    });
  }

  static list(items: string[], bullet = '•') {
    items.forEach((item) => {
      console.log(chalk.cyan(bullet), item);
    });
  }

  static divider() {
    console.log(chalk.gray('─'.repeat(50)));
  }

  static empty() {
    console.log();
  }
}