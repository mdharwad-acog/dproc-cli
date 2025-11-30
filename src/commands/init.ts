// src/commands/init.ts
import { Command } from "commander";
import { ConfigManager } from "../config/manager.js";
import { createLogger } from "../utils/logger.js";
import { Display } from "../utils/display.js";
import { input, select, password, confirm } from "@inquirer/prompts";

const log = createLogger("init");

export function createInitCommand(): Command {
  const command = new Command("init");

  command.description("Initialize dproc CLI configuration").action(async () => {
    try {
      Display.welcome("Initialize dproc CLI");

      // Check if config exists - WRAP IN TRY/CATCH
      let existingConfig;
      let configExists = false;

      try {
        existingConfig = await ConfigManager.loadCoreConfig();
        // Only consider valid if it has a provider
        if (existingConfig.llm?.provider) {
          configExists = true;
        }
      } catch (error) {
        // Config doesn't exist or is invalid - that's fine for init
        log.error("No valid config found, proceeding with initialization");
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
        gemini: "gemini-2.5-flash",
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

      // Store API key securely in keytar
      await ConfigManager.setApiKey(provider, apiKey);

      // Save core configuration (without API key in file)
      await ConfigManager.saveCoreConfig({
        llm: {
          provider: provider as any,
          model,
          apiKey: "", // Empty - actual key is in keytar
        },
        defaultOutputDir,
      });

      Display.empty();
      Display.welcome("✓ dproc CLI initialized successfully!");
      Display.empty();

      console.log(
        "ℹ Configuration saved to:",
        ConfigManager.getCoreConfigPath()
      );
      console.log("ℹ API key stored securely in system keychain");
      Display.empty();

      console.log("Next steps:");
      Display.list([
        'Run "dproc config validate" to verify your configuration',
        'Run "dproc ingest <file>" to create a data bundle',
        'Run "dproc search <bundle>" to search your data',
        'Run "dproc report <bundle> <spec>" to generate reports',
      ]);
    } catch (error: any) {
      log.error("Initialization failed:", error.message);
      process.exit(1);
    }
  });

  return command;
}
