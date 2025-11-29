// src/commands/ingest.ts
import { Command } from 'commander';
import { ConfigManager, BundleBuilder, BundleLoader, ConnectorRegistry } from '@aganitha/dproc';
import { createLogger } from '../utils/logger.js';
import { Display } from '../utils/display.js';
import { createSpinner } from '../utils/spinner.js';
import { basename, extname } from 'path';
import pkg from 'fs-extra';
const { mkdir } = pkg;

const log = createLogger('ingest');

export function createIngestCommand(): Command {
  const command = new Command('ingest');

  command
    .description('Ingest data from file and create a bundle')
    .argument('<file>', 'Input file path (CSV, JSON, XML, Parquet)')
    .option('-o, --output <dir>', 'Output directory')
    .option('-n, --name <name>', 'Bundle name')
    .action(async (filePath: string, options: any) => {
      const spinner = createSpinner('Loading configuration...');

      try {
        Display.section('Data Ingestion');

        // Load config
        spinner.start();
        await ConfigManager.load();
        spinner.succeed();

        // Determine output directory
        const config = await ConfigManager.load();
        const outputDir = options.output || config.defaultOutputDir || './output';
        await mkdir(outputDir, { recursive: true });

        // Determine bundle name
        const bundleName = options.name || basename(filePath).replace(/\.[^/.]+$/, '');
        const outputPath = `${outputDir}/${bundleName}.bundle.json`;

        // Read file using connector
        spinner.start('Reading data...');
        const ext = extname(filePath);
        const connector = ConnectorRegistry.getConnector(ext);
        const records = await connector.read(filePath);
        spinner.succeed(`Read ${records.length} records`);

        // Build bundle
        spinner.start('Creating bundle...');
        const bundle = BundleBuilder.create(records, bundleName, filePath);
        spinner.succeed('Bundle created');

        // Save bundle
        spinner.start('Saving bundle...');
        await BundleLoader.save(bundle, outputPath);
        spinner.succeed('Bundle saved');

        Display.empty();
        Display.welcome('✓ Data ingestion complete!');
        Display.empty();

        Display.empty();
        Display.section('Bundle Summary');

        const summary: Record<string, string> = {
          'Bundle': outputPath,
          'Source': filePath,
          'Records': bundle.metadata.recordCount.toString(),
          'Fields': Object.keys(bundle.stats.fieldStats).length.toString(),
          'Size': `${Math.round(JSON.stringify(bundle).length / 1024)} KB`,
        };

        Display.keyValue(summary);

        Display.empty();
        Display.section('Field Statistics');

        const fieldRows = Object.entries(bundle.stats.fieldStats).map(([field, stats]) => ({
          Field: field,
          Type: (stats as any).type || 'unknown',
          Unique: ((stats as any).uniqueCount || 0).toString(),
          Nulls: ((stats as any).nullCount || 0).toString(),
        }));

        Display.table(fieldRows);

        Display.empty();
        console.log('Next steps:');
        Display.list([
          `dproc search "${outputPath}" "your query"`,
          `dproc report "${outputPath}" spec.yaml`,
          `dproc info "${outputPath}"`,
        ]);

      } catch (error: any) {
        spinner.fail('Ingestion failed');
        log.error(error.message);
        process.exit(1);
      }
    });

  return command;
}
