import pkg from 'fs-extra';
import { homedir } from 'os';
import { join } from 'path';

const { readFile, writeFile, mkdir } = pkg;

export interface CliConfig {
  llm?: {
    provider?: string;
    model?: string;
    apiKey?: string;
  };
  defaultOutputDir?: string;
  lastUsedBundle?: string;
}

export class ConfigManager {
  private static configDir = join(homedir(), '.dproc');
  private static configFile = join(ConfigManager.configDir, 'config.json');

  static async init() {
    try {
      await mkdir(this.configDir, { recursive: true });
    } catch (error: any) {
      throw error;
    }
  }

  static async load(): Promise<CliConfig> {
    try {
      const content = await readFile(this.configFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return {};
    }
  }

  static async save(config: CliConfig) {
    try {
      await mkdir(this.configDir, { recursive: true });
      await writeFile(this.configFile, JSON.stringify(config, null, 2));
    } catch (error: any) {
      throw error;
    }
  }

  static async update(partial: Partial<CliConfig>) {
    const config = await this.load();
    await this.save({ ...config, ...partial });
  }

  static getConfigPath(): string {
    return this.configFile;
  }

  static getConfigDir(): string {
    return this.configDir;
  }
}