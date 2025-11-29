// src/commands/report.ts
import { Command } from 'commander';
import { ConfigManager, BundleLoader, ReportEngine } from '@aganitha/dproc';
import { createLogger } from '../utils/logger.js';
import { Display } from '../utils/display.js';
import { createSpinner } from '../utils/spinner.js';
import { dirname, basename } from 'path';
import pkg from 'fs-extra';
const { mkdir, writeFile } = pkg;

const log = createLogger('report');

export function createReportCommand(): Command {
  const command = new Command('report');

  command
    .description('Generate AI-powered report from bundle')
    .argument('<bundle>', 'Bundle file path')
    .argument('[spec]', 'Optional: Report specification YAML file (advanced mode)')
    .option('-o, --output <file>', 'Output file path')
    .option('-s, --style <type>', 'Report style: default|executive|technical|sales|audit', 'default')
    .option('-d, --depth <level>', 'Detail level: summary|standard|detailed|comprehensive', 'standard')
    .option(
      '-f, --focus <areas>',
      'Focus areas (comma-separated): overview,trends,insights,anomalies,recommendations,statistics'
    )
    .option('-t, --tone <tone>', 'Writing tone: professional|casual|technical|executive', 'professional')
    .option('--title <title>', 'Custom report title')
    .option('--json', 'Output report metadata as JSON')
    .action(async (bundlePath: string, specPath: string | undefined, options: any) => {
      const spinner = createSpinner('Loading configuration...');

      try {
        // Load config
        spinner.start();
        const config = await ConfigManager.load();
        
        if (!config.llm?.apiKey) {
          spinner.fail();
          log.error('LLM not configured. Run "dproc init" first.');
          process.exit(1);
        }

        // Initialize library with config
        ConfigManager.init(config);
        spinner.succeed();

        // Load bundle
        spinner.start('Loading bundle...');
        const bundle = await BundleLoader.load(bundlePath);
        spinner.succeed(`Loaded ${bundle.metadata.recordCount} records`);

        // Determine output path
        const outputPath =
          options.output || `./output/${basename(bundlePath, '.bundle.json')}-report.md`;
        await mkdir(dirname(outputPath), { recursive: true });

        // Generate report
        let report;
        const startTime = Date.now();

        if (specPath) {
          // Advanced: YAML-based report
          spinner.start('Generating report from spec...');
          log.info('Using YAML spec: %s', specPath);
          report = await ReportEngine.generate(bundle, specPath);
        } else {
          // Default: auto report
          spinner.start('Generating auto report...');
          log.info('Using auto-report mode (no spec file)');

          const focus = options.focus
            ? String(options.focus)
                .split(',')
                .map((f: string) => f.trim())
                .filter(Boolean)
            : undefined;

          report = await ReportEngine.generateAuto(bundle, {
            style: options.style,
            depth: options.depth,
            focus,
            tone: options.tone,
            title: options.title,
          });
        }

        const duration = Date.now() - startTime;

        // Check if report has content
        if (!report.content || report.content.length === 0) {
          throw new Error('Generated report content is empty');
        }

        // Save report
        await writeFile(outputPath, report.content, { encoding: 'utf-8' });
        spinner.succeed(`Report generated in ${duration}ms`);

        // Display results
        if (options.json) {
          console.log(JSON.stringify(report.metadata, null, 2));
        } else {
          Display.empty();
          Display.welcome('✓ Report generated successfully!');
          
          Display.empty();
          Display.section('Report Details');
          
          const details: Record<string, string> = {
            Title: report.metadata.title,
            Style: report.metadata.style,
            Generated: new Date(report.metadata.generatedAt).toLocaleString(),
            Output: outputPath,
            Size: `${Math.round(Buffer.byteLength(report.content) / 1024)} KB`,
            Records: (report.metadata.recordCount ?? bundle.metadata.recordCount).toLocaleString(),
          };

          Display.keyValue(details);

          Display.empty();
          console.log('Next steps:');
          Display.list([
            `cat "${outputPath}"`,
            `dproc export "${outputPath}" --html`,
            `dproc export "${outputPath}" --pdf`,
          ]);
        }

      } catch (error: any) {
        spinner.fail('Report generation failed');
        log.error(error.message);
        process.exit(1);
      }
    });

  return command;
}
