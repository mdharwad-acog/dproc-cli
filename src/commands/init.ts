import { Command } from "commander";
import { ConfigManager } from "../config/manager.js";
import { createLogger } from "../utils/logger.js";
import { Display } from "../utils/display.js";
import { input, select, password, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import ora from "ora";

const log = createLogger("init");

export function createInitCommand(): Command {
  const command = new Command("init");

  command.description("Initialize dproc CLI configuration").action(async () => {
    try {
      Display.welcome("Initialize dproc CLI");

      // Check if config exists
      let existingConfig;
      let configExists = false;

      try {
        existingConfig = await ConfigManager.loadCoreConfig();
        if (existingConfig.llm?.provider) {
          configExists = true;
        }
      } catch (error) {
        log.info("No valid config found, proceeding with initialization");
      }

      if (configExists) {
        const overwrite = await confirm({
          message: "Configuration already exists. Overwrite?",
          default: false,
        });

        if (!overwrite) {
          console.log("\nConfiguration unchanged.");
          return;
        }
      }

      Display.empty();
      Display.section("Configure LLM provider:");
      Display.empty();

      // LLM provider
      const provider = await select({
        message: "Select LLM provider:",
        choices: [
          { name: "Google Gemini", value: "gemini" },
          { name: "OpenAI", value: "openai" },
          { name: "DeepSeek", value: "deepseek" },
        ],
      });

      // Model name
      const defaultModels: Record<string, string> = {
        gemini: "gemini-1.5-flash",
        openai: "gpt-4o-mini",
        deepseek: "deepseek-chat",
      };

      const model = await input({
        message: "Enter model name:",
        default: defaultModels[provider]!,
      });

      // API key
      const apiKey = await password({
        message: "Enter API key:",
        mask: "*",
      });

      // Default output directory
      const defaultOutputDir = await input({
        message: "Default output directory:",
        default: "./output",
      });

      // Save core configuration (without API key in file)
      const configSpinner = ora("Creating configuration file...").start();
      try {
        await ConfigManager.saveCoreConfig({
          llm: {
            provider: provider as any,
            model,
            // apiKey intentionally empty - loaded from keytar/env
          },
          defaultOutputDir,
        });
        configSpinner.succeed("✓ Configuration file created");
      } catch (error) {
        configSpinner.fail("Failed to create configuration");
        process.exit(1);
      }

      // Store API key (with fallback)
      const keySpinner = ora("Storing API key securely...").start();
      let keySource: "keytar" | "env" = "env";

      try {
        await ConfigManager.setApiKey(provider, apiKey);
        keySource = "keytar";
        keySpinner.succeed(chalk.green("✓ API key stored in keychain"));
      } catch (error: any) {
        keySpinner.warn(chalk.yellow("⚠ Keytar unavailable"));

        // Set environment variable for current session
        const envVar = `${provider.toUpperCase()}_API_KEY`;
        process.env[envVar] = apiKey;
        keySource = "env";

        console.log(
          chalk.cyan(
            `\nℹ️  Environment variable set for current session:\n` +
              `  ${envVar}="${apiKey.substring(0, 8)}..."\n\n` +
              `💡 To make permanent, add to ~/.bashrc or ~/.zshrc:\n` +
              `  echo 'export ${envVar}="${apiKey}"' >> ~/.bashrc\n`
          )
        );
      }

      Display.empty();
      Display.welcome("✓ dproc CLI initialized successfully!");
      Display.empty();

      console.log(
        "ℹ Configuration saved to:",
        ConfigManager.getCoreConfigPath()
      );
      console.log(
        chalk.green(
          `ℹ API key stored: ${
            keySource === "keytar" ? "🔐 Keychain" : "📝 Environment"
          }`
        )
      );
      Display.empty();

      console.log("Next steps:");
      Display.list([
        "dproc config show       # Verify configuration",
        "dproc ingest <file>     # Create data bundle",
        "dproc search <bundle>   # Search your data",
        "dproc report <bundle>   # Generate reports",
      ]);
    } catch (error: any) {
      log.error("Initialization failed:", error.message);
      console.error(chalk.red("❌ Setup failed"));
      process.exit(1);
    }
  });

  return command;
}
