import { ConfigManager as CoreConfigManager } from "@aganitha/dproc";
import pkg from "fs-extra";
import { homedir } from "os";
import { join } from "path";

const { readFile, writeFile, mkdir } = pkg;

export interface CliConfig {
  // CLI-specific settings
  display?: {
    showBanner?: boolean;
    color?: boolean;
    verbose?: boolean;
  };
  lastUsedBundle?: string;
  recentFiles?: string[];
}

/**
 * CLI Configuration Manager
 * Extends core ConfigManager for CLI-specific settings
 */
export class ConfigManager {
  private static configDir = join(homedir(), ".dproc");
  private static cliConfigFile = join(ConfigManager.configDir, "cli.json");

  /**
   * Initialize config directory
   */
  static async init() {
    try {
      await mkdir(this.configDir, { recursive: true });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Load CLI-specific configuration
   */
  static async loadCliConfig(): Promise<CliConfig> {
    try {
      const content = await readFile(this.cliConfigFile, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      return {
        display: {
          showBanner: true,
          color: true,
          verbose: false,
        },
        recentFiles: [],
      };
    }
  }

  /**
   * Save CLI-specific configuration
   */
  static async saveCliConfig(config: CliConfig) {
    try {
      await mkdir(this.configDir, { recursive: true });
      await writeFile(this.cliConfigFile, JSON.stringify(config, null, 2));
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update CLI configuration
   */
  static async updateCliConfig(partial: Partial<CliConfig>) {
    const config = await this.loadCliConfig();
    await this.saveCliConfig({ ...config, ...partial });
  }

  /**
   * Load core dproc configuration (uses core ConfigManager)
   */
  static async loadCoreConfig() {
    return await CoreConfigManager.load();
  }

  /**
   * Save core dproc configuration (uses core ConfigManager)
   */
  static async saveCoreConfig(config: any) {
    return await CoreConfigManager.save(config);
  }

  /**
   * Set API key securely (uses core ConfigManager with keytar)
   */
  static async setApiKey(provider: string, apiKey: string) {
    return await CoreConfigManager.setApiKey(provider, apiKey);
  }

  /**
   * Get API key (uses core ConfigManager)
   */
  static async getApiKey(provider: string) {
    return await CoreConfigManager.getApiKey(provider);
  }

  /**
   * Delete API key (uses core ConfigManager)
   */
  static async deleteApiKey(provider: string) {
    return await CoreConfigManager.deleteApiKey(provider);
  }

  /**
   * List API keys (uses core ConfigManager)
   */
  static async listApiKeys() {
    return await CoreConfigManager.listApiKeys();
  }

  /**
   * Validate configuration (uses core ConfigManager)
   */
  static validateCoreConfig() {
    return CoreConfigManager.validate();
  }

  /**
   * Get config paths
   */
  static getConfigPath(): string {
    return this.cliConfigFile;
  }

  static getConfigDir(): string {
    return this.configDir;
  }

  static getCoreConfigPath(): string {
    return join(this.configDir, "config.yml");
  }
}
