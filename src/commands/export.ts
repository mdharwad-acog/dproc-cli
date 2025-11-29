// src/commands/export.ts
import { Command } from 'commander';
import { ConfigManager } from '@aganitha/dproc';
import { createLogger } from '../utils/logger.js';
import { Display } from '../utils/display.js';
import { createSpinner } from '../utils/spinner.js';
import { readFile, writeFile } from 'fs/promises';
import { basename, dirname } from 'path';
import { marked } from 'marked';
import puppeteer from 'puppeteer';
import pkg from 'fs-extra';
const { mkdir } = pkg;

const log = createLogger('export');

export function createExportCommand(): Command {
  const command = new Command('export');

  command
    .description('Export markdown to other formats')
    .argument('<input>', 'Input markdown file')
    .option('--html', 'Export to HTML')
    .option('--pdf', 'Export to PDF')
    .option('--mdx', 'Export to MDX')
    .option('--title <title>', 'Document title')
    .option('--author <author>', 'Document author')
    .option('--toc', 'Include table of contents')
    .action(async (inputPath: string, options: any) => {
      const spinner = createSpinner('Loading configuration...');

      try {
        // Load config
        spinner.start();
        await ConfigManager.load();
        spinner.succeed();

        const baseName = basename(inputPath, '.md');
        const baseDir = dirname(inputPath);
        const formats = [];

        if (options.html) formats.push('html');
        if (options.pdf) formats.push('pdf');
        if (options.mdx) formats.push('mdx');

        if (formats.length === 0) {
          log.error('No export format specified. Use --html, --pdf, or --mdx');
          process.exit(1);
        }

        // Read markdown content
        const markdown = await readFile(inputPath, 'utf-8');

        Display.section('Export');

        for (const format of formats) {
          spinner.start(`Exporting to ${format.toUpperCase()}...`);
          
          const outputPath = `${baseDir}/${baseName}.${format}`;
          
          try {
            if (format === 'html') {
              await exportToHtml(markdown, outputPath, options);
            } else if (format === 'pdf') {
              await exportToPdf(markdown, outputPath, options);
            } else if (format === 'mdx') {
              await exportToMdx(markdown, outputPath, options);
            }

            spinner.succeed(`Exported to ${outputPath}`);
          } catch (err: any) {
            spinner.fail(`Failed to export to ${format}`);
            log.error(err.message);
          }
        }

        Display.empty();
        Display.welcome('✓ Export complete!');
        Display.empty();

        console.log('Exported files:');
        Display.list(formats.map(f => `${baseDir}/${baseName}.${f}`));

      } catch (error: any) {
        spinner.fail('Export failed');
        log.error(error.message);
        process.exit(1);
      }
    });

  return command;
}

async function exportToHtml(markdown: string, outputPath: string, options: any) {
  const html = marked.parse(markdown);
  const title = options.title || 'Report';
  const author = options.author || '';

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1, h2, h3 { color: #2c3e50; }
    code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 5px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.75rem; text-align: left; }
    th { background: #f8f9fa; font-weight: 600; }
  </style>
</head>
<body>
  ${options.toc ? generateTOC(markdown) : ''}
  ${html}
  ${author ? `<hr><p><em>Author: ${author}</em></p>` : ''}
</body>
</html>`;

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, fullHtml, 'utf-8');
}

async function exportToPdf(markdown: string, outputPath: string, options: any) {
  // First create HTML
  const tempHtmlPath = outputPath.replace('.pdf', '.temp.html');
  await exportToHtml(markdown, tempHtmlPath, options);

  // Convert to PDF
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
  });

  await browser.close();

  // Clean up temp HTML
  const fs = await import('fs/promises');
  await fs.unlink(tempHtmlPath);
}

async function exportToMdx(markdown: string, outputPath: string, options: any) {
  const title = options.title || 'Report';
  const author = options.author || '';

  const mdx = `---
title: "${title}"
${author ? `author: "${author}"` : ''}
date: "${new Date().toISOString()}"
---

${markdown}
`;

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, mdx, 'utf-8');
}

function generateTOC(markdown: string): string {
  const headings = markdown.match(/^#{1,3}\s+.+$/gm) || [];
  if (headings.length === 0) return '';

  let toc = '<nav class="toc"><h2>Table of Contents</h2><ul>';
  
  headings.forEach(heading => {
    const level = heading.match(/^#+/)?.[0].length || 1;
    const text = heading.replace(/^#+\s+/, '');
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    
    toc += `<li style="margin-left: ${(level - 1) * 1.5}rem"><a href="#${id}">${text}</a></li>`;
  });
  
  toc += '</ul></nav><hr>';
  return toc;
}
