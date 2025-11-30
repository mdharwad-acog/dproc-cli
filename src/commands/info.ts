// src/commands/info.ts
import { Command } from "commander";
import { ConfigManager, BundleLoader } from "@aganitha/dproc";
import { createLogger } from "../utils/logger.js";
import { Display } from "../utils/display.js";
import { createSpinner } from "../utils/spinner.js";

const log = createLogger("info");

export function createInfoCommand(): Command {
  const command = new Command("info");

  command
    .description("Display bundle information")
    .argument("<bundle>", "Bundle file path")
    .option("--samples", "Show sample records")
    .option("--json", "Output as JSON")
    .action(async (bundlePath: string, options: any) => {
      const spinner = createSpinner("Loading bundle...");

      try {
        // Load config
        await ConfigManager.load();

        // Load bundle
        spinner.start();
        const bundle = await BundleLoader.load(bundlePath);
        spinner.succeed();

        if (options.json) {
          const info = {
            source: bundle.metadata.source,
            format: bundle.metadata.format,
            recordCount: bundle.metadata.recordCount,
            fieldCount: Object.keys(bundle.stats.fieldStats).length,
            fields: Object.keys(bundle.stats.fieldStats),
            stats: bundle.stats,
            samples: options.samples ? bundle.samples.main : undefined,
          };
          console.log(JSON.stringify(info, null, 2));
          return;
        }

        Display.section("Bundle Information");

        const info: Record<string, string> = {
          Source: bundle.metadata.source,
          Format: bundle.metadata.format,
          Records: bundle.metadata.recordCount.toString(),
          Fields: Object.keys(bundle.stats.fieldStats).length.toString(),
        };

        Display.keyValue(info);

        Display.empty();
        Display.section("Field Statistics");

        // Fixed: Display.table expects (headers, rows)
        const fieldHeaders = ["Field", "Type", "Unique", "Nulls", "Null %"];
        const fieldRows = Object.entries(bundle.stats.fieldStats).map(
          ([field, stats]) => {
            const fieldStats = stats as any;
            return [
              field,
              fieldStats.type || "unknown",
              (fieldStats.uniqueCount || 0).toString(),
              (fieldStats.nullCount || 0).toString(),
              (
                ((fieldStats.nullCount || 0) / bundle.metadata.recordCount) *
                100
              ).toFixed(1) + "%",
            ];
          }
        );

        Display.table(fieldHeaders, fieldRows);

        if (options.samples) {
          Display.empty();
          Display.section(`Sample Records (${bundle.samples.main.length})`);

          // Convert sample records to table format
          if (bundle.samples.main.length > 0) {
            const sampleHeaders = Object.keys(bundle.samples.main[0]!);
            const sampleRows = bundle.samples.main.map((record) =>
              sampleHeaders.map((key) => String(record[key] ?? ""))
            );
            Display.table(sampleHeaders, sampleRows);
          }
        }
      } catch (error: any) {
        spinner.fail("Failed to load bundle");
        log.error(error.message);
        process.exit(1);
      }
    });

  return command;
}
