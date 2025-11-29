// src/commands/init.ts
import { Command } from 'commander';
import { ConfigManager } from '@aganitha/dproc';
import { createLogger } from '../utils/logger.js';
import { Display } from '../utils/display.js';
import { input, select, password } from '@inquirer/prompts';

const log = createLogger('init');

export function createInitCommand(): Command {
  const command = new Command('init');

  command
    .description('Initialize dproc CLI configuration')
    .action(async () => {
      try {
        Display.welcome('Initialize dproc CLI');

        // Check if config exists
        const existingConfig = await ConfigManager.load();
        
        if (existingConfig.llm?.apiKey) {
          const overwrite = await select({
            message: 'Configuration already exists. Overwrite?',
            choices: [
              { name: 'Yes', value: true },
              { name: 'No', value: false },
            ],
          });

          if (!overwrite) {
            console.log('\nConfiguration unchanged.');
            return;
          }
        }

        Display.empty();
        Display.section('Configure LLM provider:');
        Display.empty();

        // LLM provider
        const provider = await select({
          message: 'Select LLM provider:',
          choices: [
            { name: 'Google Gemini', value: 'gemini' },
            { name: 'OpenAI', value: 'openai' },
            { name: 'DeepSeek', value: 'deepseek' },
          ],
        });

        // Model name
        const defaultModels: Record<string, string> = {
          gemini: 'gemini-2.5-flash',
          openai: 'gpt-4o-mini',
          deepseek: 'deepseek-chat',
        };

        const model = await input({
          message: 'Enter model name:',
          default: defaultModels[provider]!,
        });

        // API key
        const apiKey = await password({
          message: 'Enter API key:',
          mask: '*',
        });

        // Default output directory
        const defaultOutputDir = await input({
          message: 'Default output directory:',
          default: './output',
        });

        // Save configuration using library ConfigManager
        await ConfigManager.save({
          llm: {
            provider: provider as any,
            model,
            apiKey,
          },
          defaultOutputDir,
        });

        Display.empty();
        Display.welcome('✓ dproc CLI initialized successfully!');
        Display.empty();

        console.log('ℹ Configuration saved to:', ConfigManager.getConfigDir() + '/config.json');
        Display.empty();

        console.log('Next steps:');
        Display.list([
          'Run "dproc ingest <file>" to create a data bundle',
          'Run "dproc search <bundle>" to search your data',
          'Run "dproc report <bundle> <spec>" to generate reports',
        ]);

      } catch (error: any) {
        log.error('Initialization failed:', error.message);
        process.exit(1);
      }
    });

  return command;
}
