// src/commands/search.ts
import { Command } from "commander";
import { ConfigManager, BundleLoader, SearchEngine } from "@aganitha/dproc";
import { createLogger } from "../utils/logger.js";
import { Display } from "../utils/display.js";
import { createSpinner } from "../utils/spinner.js";

const log = createLogger("search");

export function createSearchCommand(): Command {
  const command = new Command("search");

  command
    .description("Search bundle using natural language")
    .argument("<bundle>", "Bundle file path")
    .argument("<query>", "Natural language search query")
    .option("-l, --limit <number>", "Maximum number of results", "10")
    .option("--json", "Output as JSON")
    .action(async (bundlePath: string, query: string, options: any) => {
      const spinner = createSpinner("Loading configuration...");

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
        spinner.start("Loading bundle...");
        const bundle = await BundleLoader.load(bundlePath);
        spinner.succeed(`Loaded ${bundle.metadata.recordCount} records`);

        Display.empty();
        Display.section("Search Query");
        console.log(`"${query}"`);
        Display.empty();

        // Execute search
        spinner.start("Executing search...");
        const startTime = Date.now();
        const result = await SearchEngine.query(bundle, query, {
          limit: parseInt(options.limit, 10),
        });
        const duration = Date.now() - startTime;
        spinner.succeed(
          `Found ${result.totalMatches} matches in ${duration}ms`
        );

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        Display.empty();
        Display.section("Answer");
        console.log(result.answer);

        if (result.insights && result.insights.length > 0) {
          Display.empty();
          Display.section("Insights");
          Display.list(result.insights);
        }

        if (result.stats && Object.keys(result.stats).length > 0) {
          Display.empty();
          Display.section("Statistics");
          Display.keyValue(result.stats);
        }

        Display.empty();
        Display.section(`Matching Records (${result.matchingRecords.length})`);

        // Fixed: Convert records to table format (headers + rows)
        if (result.matchingRecords.length > 0) {
          const firstRecord = result.matchingRecords[0];
          const headers = Object.keys(firstRecord!);
          const rows = result.matchingRecords.map((record) =>
            headers.map((header) => String(record[header] ?? ""))
          );
          Display.table(headers, rows);
        } else {
          console.log("No matching records found");
        }
      } catch (error: any) {
        spinner.fail("Search failed");
        log.error(error.message);
        process.exit(1);
      }
    });

  return command;
}
