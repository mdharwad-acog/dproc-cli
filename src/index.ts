// src/index.ts
import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Display } from './utils/display.js';
import { createInitCommand } from './commands/init.js';
import { createIngestCommand } from './commands/ingest.js';
import { createInfoCommand } from './commands/info.js';
import { createSearchCommand } from './commands/search.js';
import { createReportCommand } from './commands/report.js';
import { createExportCommand } from './commands/export.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getVersion(): Promise<string> {
  try {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch {
    return '0.0.0';
  }
}

async function main() {
  const version = await getVersion();

  Display.banner();

  const program = new Command();

  program
    .name('dproc')
    .description('AI-powered data processing CLI')
    .version(version);

  // Register commands
  program.addCommand(createInitCommand());
  program.addCommand(createIngestCommand());
  program.addCommand(createInfoCommand());
  program.addCommand(createSearchCommand());
  program.addCommand(createReportCommand());
  program.addCommand(createExportCommand());

  program.parse();
}

main();
