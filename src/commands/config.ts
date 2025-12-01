// src/commands/config.ts
import { Command } from "commander";
import { ConfigManager } from "../config/manager.js";
import { createLogger } from "../utils/logger.js";
import { Display } from "../utils/display.js";
import ora from "ora";
import chalk from "chalk";

const log = createLogger("config");

export function createConfigCommand(): Command {
  const command = new Command("config").description(
    "Manage dproc configuration"
  );

  // Set API key
  command
    .command("set-key")
    .description("Store API key securely in system keychain")
    .argument("<provider>", "LLM provider (openai, gemini, deepseek)")
    .argument("<key>", "API key")
    .action(async (provider: string, key: string) => {
      const spinner = ora(`Storing ${provider} API key...`).start();

      try {
        await ConfigManager.setApiKey(provider, key);
        spinner.succeed(`API key for ${provider} stored securely`);
      } catch (error: any) {
        spinner.fail("Failed to store API key");
        log.error(error.message);
        process.exit(1);
      }
    });

  // Get API key (masked)
  command
    .command("get-key")
    .description("Retrieve API key (masked)")
    .argument("<provider>", "LLM provider")
    .action(async (provider: string) => {
      try {
        const key = await ConfigManager.getApiKey(provider);

        if (key) {
          const masked = key.substring(0, 8) + "...";
          console.log(chalk.green(`✓ API key for ${provider}: ${masked}`));
        } else {
          console.log(chalk.yellow(`⚠ No API key found for ${provider}`));
        }
      } catch (error: any) {
        log.error(error.message);
        process.exit(1);
      }
    });

  // Delete API key
  command
    .command("delete-key")
    .description("Delete API key from keychain")
    .argument("<provider>", "LLM provider")
    .action(async (provider: string) => {
      const spinner = ora(`Deleting ${provider} API key...`).start();

      try {
        const deleted = await ConfigManager.deleteApiKey(provider);

        if (deleted) {
          spinner.succeed(`API key for ${provider} deleted`);
        } else {
          spinner.warn(`No API key found for ${provider}`);
        }
      } catch (error: any) {
        spinner.fail("Failed to delete API key");
        log.error(error.message);
        process.exit(1);
      }
    });

  // List stored keys
  command
    .command("list-keys")
    .description("List stored API key providers")
    .action(async () => {
      try {
        const providers = await ConfigManager.listApiKeys();

        if (providers.length === 0) {
          console.log(chalk.yellow("No API keys stored"));
          return;
        }

        Display.section("Stored API keys:");
        providers.forEach((provider) => {
          console.log(chalk.green(`  ✓ ${provider}`));
        });
      } catch (error: any) {
        log.error(error.message);
        process.exit(1);
      }
    });

  // Validate configuration
  command
    .command("validate")
    .description("Validate current configuration")
    .action(async () => {
      const spinner = ora("Validating configuration...").start();

      try {
        await ConfigManager.loadCoreConfig();
        const validation = ConfigManager.validateCoreConfig();

        if (validation.valid) {
          spinner.succeed("Configuration is valid");
        } else {
          spinner.fail("Configuration validation failed");
          console.error(chalk.red(JSON.stringify(validation.errors, null, 2)));
          process.exit(1);
        }
      } catch (error: any) {
        spinner.fail("Configuration validation failed");
        log.error(error.message);
        process.exit(1);
      }
    });

  // Show configuration
  command
    .command("show")
    .description("Display current configuration (API keys masked)")
    .action(async () => {
      try {
        const config = await ConfigManager.loadCoreConfig();

        // Mask API keys
        const display = JSON.parse(JSON.stringify(config));
        if (display.llm?.apiKey) {
          display.llm.apiKey = "[stored in keychain]";
        }

        Display.section("Current Configuration:");
        console.log(JSON.stringify(display, null, 2));
      } catch (error: any) {
        log.error(error.message);
        process.exit(1);
      }
    });

  return command;
}
