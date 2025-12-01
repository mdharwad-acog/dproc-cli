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
    .description("Store API key (keychain or environment)")
    .argument("<provider>", "LLM provider (gemini, openai, deepseek)")
    .argument("<key>", "API key")
    .action(async (provider: string, key: string) => {
      const spinner = ora(`Storing ${provider} API key...`).start();

      try {
        await ConfigManager.setApiKey(provider, key);
        spinner.succeed(chalk.green(`✓ API key stored in keychain (🔐)`));
      } catch (error: any) {
        spinner.warn(chalk.yellow("⚠ Keytar unavailable"));

        // Fallback to environment variable
        const envVar = `${provider.toUpperCase()}_API_KEY`;
        process.env[envVar] = key;

        console.log(
          chalk.cyan(
            `\nℹ️  Environment variable set for current session:\n` +
              `  ${envVar}="${key.substring(0, 8)}..."\n\n` +
              `💡 To make permanent:\n` +
              `  echo 'export ${envVar}="${key}"' >> ~/.bashrc`
          )
        );
      }
    });

  // Get API key (with source)
  command
    .command("get-key")
    .description("Show API key status and source")
    .argument("<provider>", "LLM provider")
    .action(async (provider: string) => {
      try {
        const { key, source } = await ConfigManager.getApiKeyWithSource(
          provider
        );

        console.log(chalk.bold(`${provider} API Key:`));

        if (key) {
          const masked =
            key.substring(0, 8) + "..." + key.substring(key.length - 4);
          const sourceIcon =
            source === "keytar" ? "🔐 Keychain" : "📝 Environment";
          console.log(chalk.green(`  ✓ ${masked}`));
          console.log(chalk.cyan(`  Source: ${sourceIcon}`));
        } else {
          console.log(chalk.yellow(`  ⚠ Not found`));
          console.log(
            chalk.dim(`  Set with: dproc config set-key ${provider} <key>`)
          );
        }
      } catch (error: any) {
        log.error(error.message);
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
          spinner.warn(`No API key found in keychain for ${provider}`);
        }
      } catch (error: any) {
        spinner.warn("Keytar unavailable");
        console.log(chalk.gray("No keychain storage to delete from"));
      }
    });

  // List stored keys (with sources)
  command
    .command("list-keys")
    .description("List all API keys with sources")
    .action(async () => {
      try {
        const keysWithSources = await ConfigManager.listApiKeysWithSources();

        if (keysWithSources.length === 0) {
          console.log(chalk.yellow("No API keys configured"));
          console.log(
            chalk.dim("Set with: dproc config set-key <provider> <key>")
          );
          return;
        }

        Display.section("API Keys:");
        keysWithSources.forEach(({ provider, source }) => {
          const icon = source === "keytar" ? "🔐" : "📝";
          const sourceText = source === "keytar" ? "Keychain" : "Environment";
          console.log(chalk.green(`  ${icon} ${provider} (${sourceText})`));
        });
      } catch (error: any) {
        log.error(error.message);
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

  // Show configuration (enhanced with sources)
  command
    .command("show")
    .description("Display current configuration + API key sources")
    .action(async () => {
      Display.section("📋 dproc Configuration");

      // Config file
      console.log(chalk.bold("\nConfig File:"));
      try {
        const config = await ConfigManager.loadCoreConfig();
        console.log(chalk.green(`  ✓ ${ConfigManager.getCoreConfigPath()}`));
        console.log(chalk.dim(JSON.stringify(config, null, 2)));
      } catch (error: any) {
        console.log(chalk.yellow("  ⚠ No config file found"));
        console.log(chalk.dim("  Run: dproc init"));
      }

      // API Keys with sources
      console.log(chalk.bold("\nAPI Keys:"));
      const keysWithSources = await ConfigManager.listApiKeysWithSources();

      if (keysWithSources.length === 0) {
        console.log(chalk.yellow("  ⚠ None configured"));
      } else {
        for (const { provider, source } of keysWithSources) {
          const icon = source === "keytar" ? "🔐" : "📝";
          const sourceText = source === "keytar" ? "Keychain" : "Environment";
          console.log(chalk.green(`  ${icon} ${provider}: ${sourceText}`));
        }
      }

      // Ready status
      console.log(chalk.bold("\n🚀 Status:"));
      try {
        const config = await ConfigManager.loadCoreConfig();
        const provider = config.llm?.provider;
        const { key } = await ConfigManager.getApiKeyWithSource(
          provider || "gemini"
        );

        if (provider && key) {
          console.log(chalk.green("  ✓ READY TO USE"));
          console.log(chalk.cyan("  dproc ingest data.csv"));
        } else {
          console.log(chalk.yellow("  ⚠ INCOMPLETE"));
          if (!provider) console.log(chalk.dim("  • Run: dproc init"));
          if (!key)
            console.log(
              chalk.dim("  • Set: dproc config set-key gemini <key>")
            );
        }
      } catch {
        console.log(chalk.yellow("  ⚠ Not configured"));
        console.log(chalk.dim("  Run: dproc init"));
      }
    });

  return command;
}
