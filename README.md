# @aganitha/dproc-cli

> 🎓 **Training Project** - Command-line interface for @aganitha/dproc data processing

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://npm.aganitha.ai/@aganitha/dproc-cli)
[![Status](https://img.shields.io/badge/status-training-orange.svg)](https://npm.aganitha.ai/@aganitha/dproc-cli)

## ⚠️ Important Disclaimer

**This is a training/learning project** developed to explore CLI tooling patterns with TypeScript. It is **NOT production-ready**.

**Use for:**

- ✅ Learning CLI development with TypeScript/Commander
- ✅ Testing dproc workflows via command line
- ✅ Educational purposes and prototyping
- ✅ Understanding keytar integration

**DO NOT use in production** without significant enhancements and testing.

---

## What is dproc-cli?

A command-line tool for the `@aganitha/dproc` data processing library that provides:

- Interactive project initialization with LLM provider selection
- Secure API key management using system keychain (keytar)
- Data ingestion from multiple formats (CSV, JSON, XML, Parquet)
- Natural language search over data bundles
- AI-powered report generation
- Multi-format export (HTML, PDF, MDX)

**Built to learn:** CLI design patterns, interactive prompts, secure credential storage, and terminal UX.

---

## Installation

Configure Aganitha private registry (one-time setup)
npm config set @aganitha:registry https://npm.aganitha.ai/

Install globally

```shell
npm install -g @aganitha/dproc-cli
```

or

```shell
pnpm add -g @aganitha/dproc-cli
```

text

**Prerequisites:**

- Node.js >= 18.0.0
- npm registry configured for @aganitha scope
- `@aganitha/dproc` library (installed automatically)

**Verify installation:**

```shell
dproc --version
dproc --help
```

text

---

## Quick Start

```shell
1. Interactive setup (creates config + stores API keys)
   dproc init

2. Ingest data file → create bundle
   dproc ingest sales.csv

3. Search bundle with natural language
   dproc search sales.bundle.json "Who were the top 5 salespeople in Q4?"

4. Generate report from YAML spec
   dproc report sales.bundle.json quarterly-report.yaml

5. Export to HTML/PDF
   dproc export quarterly-report.md quarterly-report.html html
   dproc export quarterly-report.md quarterly-report.pdf pdf
```

text

---

## Commands Overview

| Command  | Description                     | Example                                   |
| -------- | ------------------------------- | ----------------------------------------- |
| `init`   | Interactive project setup       | `dproc init`                              |
| `config` | Manage configuration & API keys | `dproc config set-key gemini sk-...`      |
| `ingest` | Create bundle from file         | `dproc ingest data.csv`                   |
| `info`   | Show bundle statistics          | `dproc info data.bundle.json`             |
| `search` | Natural language search         | `dproc search bundle.json "query"`        |
| `report` | Generate report from spec       | `dproc report bundle.json spec.yaml`      |
| `export` | Export to HTML/PDF/MDX          | `dproc export report.md output.html html` |

---

## Detailed Command Reference

### `dproc init`

Interactive project initialization wizard.

```shell
dproc init
```

text

**What it does:**

1. Prompts for LLM provider selection (Gemini/OpenAI/DeepSeek)
2. Asks for model selection
3. Securely stores API key in system keychain (keytar)
4. Creates `dproc.config.yml` in current directory
5. Sets up directory structure

**Creates:**

- `dproc.config.yml` - Project configuration
- API keys stored in system keychain

**Interactive prompts:**
? Select LLM provider: Gemini / OpenAI / DeepSeek
? Select model: gemini-1.5-flash / gemini-1.5-pro / ...
? Enter API key: [hidden input]
? Output directory: ./output
? Create custom templates directory? Yes/No
? Create custom prompts directory? Yes/No

text

---

### `dproc config`

Manage configuration and securely store API keys.

#### **Subcommands:**

**Set API key** (stores in system keychain)
dproc config set-key <provider> <key>

Examples:

```shell
dproc config set-key gemini sk-proj-abc123...
dproc config set-key openai sk-proj-xyz789...
dproc config set-key deepseek sk-deepseek-456...
```

text

**Get API key** (shows masked value)

```shell
dproc config get-key <provider>
```

Example output:
✓ API key for gemini: sk-proj-a...
text

**List stored keys**

```shell
dproc config list-keys
```

Example output:
Stored API keys:
✓ gemini
✓ openai
text

**Delete API key**

```shell
dproc config delete-key <provider>
```

text

**Show current configuration** (API keys masked)

```shell
dproc config show
```

Shows current config from all sources
text

**Validate configuration**

```shell
dproc config validate
```

Checks config against Zod schema
text

---

### `dproc ingest`

Ingest data from file and create a bundle.

```shell
dproc ingest <file> [options]

Options:
-o, --output <dir> Output directory (default: ./output)
-n, --name <name> Bundle name (default: filename without extension)
```

text

**Supported file formats:**

- CSV (`.csv`)
- TSV (`.tsv`)
- JSON (`.json`)
- XML (`.xml`)
- Parquet (`.parquet`)

**Examples:**
Basic ingestion

```shell
dproc ingest sales.csv

→ Creates: ./output/sales.bundle.json
Custom output directory
dproc ingest data.parquet -o ./bundles

Custom bundle name
dproc ingest customers.json -n customer-data -o ./bundles
```

→ Creates: ./bundles/customer-data.bundle.json
text

**Output includes:**

- Bundle summary (records, fields, size)
- Field-level statistics (types, unique counts, nulls)
- Sample records preview
- Suggested next steps

---

### `dproc info`

Display detailed bundle statistics and metadata.

```shell
dproc info <bundle> [options]

Options:
--json Output as JSON
```

text

**Example:**

```shell
dproc info sales.bundle.json
```

text

**Shows:**

- Metadata (source file, format, record count, creation date)
- Field statistics table (field name, type, unique values, null count)
- Sample records (first few + random samples)

**JSON output:**

```shell
dproc info sales.bundle.json --json > bundle-info.json
```

text

---

### `dproc search`

Search bundle using natural language queries.

```shell
dproc search <bundle> "<query>" [options]

Options:
-l, --limit <number> Maximum number of results (default: 10)
--json Output results as JSON
```

text

**Examples:**

```shell
Basic search
dproc search sales.bundle.json "top 5 salespeople by revenue"

Limit results
dproc search customers.bundle.json "customers in California" -l 20

JSON output
dproc search data.bundle.json "active users" --json
```

text

**Output includes:**

- Natural language answer from AI
- Key insights extracted by AI
- Aggregate statistics
- Matching records table
- Execution time

**Note:** Requires LLM configuration (run `dproc init` first).

---

### `dproc report`

```shell
Generate report from bundle and YAML specification.

dproc report <bundle> <spec.yaml> [output]

Options:
--json Output metadata as JSON
```

text

**Example:**

```shell
dproc report sales.bundle.json quarterly-report.yaml output/q4-report.md
```

text

**Report spec structure** (YAML):

```yml
id: quarterly-sales
name: Q4 Sales Report
templateFile: quarterly-template.njk

variables:

name: totalRevenue
type: number
source: bundle

name: topPerformers
type: array
source: bundle

name: insights
type: markdown
source: llm
promptFile: insights-prompt.md

options:
temperature: 0.7
maxTokens: 2000
```

text

**Templates:** Uses Nunjucks template engine (`.njk` files)

---

### `dproc export`

Export markdown report to HTML, PDF, or MDX.

```shell
dproc export <input.md> <output> <format>
```

Formats: html | pdf | mdx

text

**Examples:**

```shell
Export to HTML (with Bootstrap styling)
dproc export report.md report.html html

Export to PDF (via Puppeteer)
dproc export report.md report.pdf pdf

Export to MDX (for Next.js/Docusaurus)
dproc export report.md report.mdx mdx
```

text

**Format details:**

- **HTML** - Includes Bootstrap CSS, table of contents
- **PDF** - Generated using headless Chrome (Puppeteer)
- **MDX** - For Next.js/Docusaurus documentation sites

---

## Complete Workflow Example

```shell
1. Initialize project (one-time setup)
   dproc init

→ Creates config, stores API key in keychain 2. Ingest annual sales data
dproc ingest sales-2024.csv -o ./bundles -n annual-sales

→ Creates: ./bundles/annual-sales.bundle.json 3. Explore bundle metadata
dproc info ./bundles/annual-sales.bundle.json

→ Shows statistics, field info, samples 4. Run natural language queries
dproc search ./bundles/annual-sales.bundle.json "What were total sales by region in Q4?"

→ AI-generated answer + insights 5. Generate comprehensive report
dproc report ./bundles/annual-sales.bundle.json reports/annual-spec.yaml output/annual-report.md

→ Creates: output/annual-report.md 6. Export to multiple formats
dproc export output/annual-report.md output/annual-report.html html
dproc export output/annual-report.md output/annual-report.pdf pdf

→ Creates: output/annual-report.html, output/annual-report.pdf
```

text

---

## Configuration

### Configuration Sources (Priority Order)

1. **keytar** - System keychain (`apikey-gemini`, `apikey-openai`, `apikey-deepseek`) ✅ Most secure
2. **Environment variables** - `GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`
3. **Project config** - `dproc.config.yml` (current directory)
4. **Global config** - `~/.dproc/config.yml` or `~/.dproc/config.json`

### Config File Structure (YAML)

**Project config** (`dproc.config.yml`):

```yml
llm:
provider: gemini
model: gemini-1.5-flash

apiKey stored in keytar, not in config file
templates:
customDir: ./templates

prompts:
customDir: ./prompts

defaultOutputDir: ./output

search:
defaultLimit: 10
temperature: 0.7

reports:
defaultOutputDir: ./reports

export:
defaultFormats:

- html
- pdf
  includeTableOfContents: true
```

text

### Secure API Key Storage

**Recommended approach** (uses keytar):
Store API key securely in system keychain

```shell
dproc config set-key gemini $GEMINI_API_KEY
dproc config set-key openai $OPENAI_API_KEY

Verify storage
dproc config list-keys

→ gemini, openai
```

**Alternative** (environment variables):

```shell
export GEMINI_API_KEY=sk-proj-...
export OPENAI_API_KEY=sk-proj-...
export DEEPSEEK_API_KEY=sk-...
```

text

**Not recommended** (plain text in config - only for testing):

```yml
llm:
provider: gemini
apiKey: sk-proj-... # Avoid this in production
```

text

---

## Project Structure

```
@aganitha/dproc-cli/
├── dist/ # Compiled JavaScript
│ └── index.js # CLI entry point (#!/usr/bin/env node)
├── src/
│ ├── commands/ # Command implementations
│ │ ├── init.ts # Interactive setup
│ │ ├── config.ts # Config management
│ │ ├── ingest.ts # Data ingestion
│ │ ├── info.ts # Bundle info
│ │ ├── search.ts # NL search
│ │ ├── report.ts # Report generation
│ │ └── export.ts # Export to HTML/PDF/MDX
│ ├── config/ # Config manager wrapper
│ ├── utils/ # CLI utilities
│ │ ├── display.ts # Formatted output (chalk, boxen)
│ │ ├── logger.ts # Debug logging
│ │ └── spinner.ts # ora spinners
│ └── index.ts # Commander program setup
└── package.json
```

text

**Command registration** (`src/index.ts`):

```javascript
program
  .addCommand(createInitCommand())
  .addCommand(createConfigCommand())
  .addCommand(createIngestCommand())
  .addCommand(createInfoCommand())
  .addCommand(createSearchCommand())
  .addCommand(createReportCommand())
  .addCommand(createExportCommand());
```

text

---

## Known Limitations

Since this is a **training project**, be aware of:

### ⚠️ User Experience

- Basic error messages (not user-friendly)
- Limited input validation
- No progress bars for long operations
- No command history or autocomplete

### ⚠️ Features

- No batch processing of multiple files
- No watch mode for auto-regeneration
- No diff/comparison between bundles
- No bundle merging or splitting

### ⚠️ Reliability

- No graceful handling of interrupted operations
- No automatic retry on network failures
- Limited error recovery
- No transaction rollback

### ⚠️ Performance

- No parallel processing
- Large file ingestion can be slow
- PDF export uses Puppeteer (heavy)
- No caching of intermediate results

### ⚠️ Testing

- No automated tests
- No integration tests
- Manual testing only

---

## Development Status

| Command  | Status     | Notes                           |
| -------- | ---------- | ------------------------------- |
| `init`   | ✅ Working | Interactive setup with inquirer |
| `config` | ✅ Working | Full keytar integration         |
| `ingest` | ✅ Working | All formats supported           |
| `info`   | ✅ Working | Detailed statistics             |
| `search` | ✅ Working | Natural language queries        |
| `report` | ⚠️ Basic   | YAML specs working              |
| `export` | ⚠️ Basic   | HTML/PDF functional             |

---

## Package Information

```json
{
  "name": "@aganitha/dproc-cli",
  "version": "1.0.1",
  "description": "CLI tool for dproc - AI-powered data processing",
  "type": "module",
  "bin": {
    "dproc": "./dist/index.js"
  },
  "publishConfig": {
    "registry": "https://npm.aganitha.ai/"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

text

**Published:** https://npm.aganitha.ai/@aganitha/dproc-cli

**Key Dependencies:**

- `@aganitha/dproc@1.0.2` - Core data processing library
- `commander@14.0.2` - CLI framework
- `inquirer@13.0.1` - Interactive prompts
- `@inquirer/prompts@8.0.1` - Modern prompt components
- `keytar@7.9.0` - Secure credential storage
- `chalk@5.6.2` - Terminal colors
- `ora@9.0.0` - Elegant spinners
- `boxen@8.0.1` - Terminal boxes
- `cli-table3@0.6.5` - Terminal tables
- `dotenv@17.2.3` - Environment variables
- `fs-extra@11.3.2` - Enhanced file operations
- `debug@4.4.3` - Debug logging

---

## Development

```shell
Clone repository
git clone https://github.com/mdharwad-acog/dproc-cli.git
cd dproc-cli

Install dependencies
pnpm install

Build TypeScript
pnpm build

Development mode (watch)
pnpm dev

Link for local testing
npm link

or
pnpm link --global

Test globally linked version
dproc --version
dproc --help

Unlink when done
npm unlink -g @aganitha/dproc-cli

Publish to Aganitha registry
npm publish
```

text

**Build scripts:**

- `pnpm build` - Compile TypeScript to `dist/`
- `pnpm dev` - Watch mode with auto-rebuild
- `pnpm clean` - Remove `dist/` directory
- `pnpm prepublishOnly` - Clean + build before publish
- `npm link` - Create global symlink for testing

---

## Project Context

**Purpose:** Built as a learning exercise to understand:

- CLI design patterns with Commander.js
- Interactive terminal UX with Inquirer
- Secure credential management with keytar
- Terminal styling with chalk/ora/boxen
- Integration with library packages

**Timeline:** Developed November 26-30, 2025

**Author:** Built during TypeScript/LLM training at Aganitha Cognitive Solutions

**Not Suitable For:**

- ❌ Production data processing pipelines
- ❌ Automated batch processing
- ❌ High-frequency operations
- ❌ Mission-critical workflows

**Good For:**

- ✅ Learning CLI development
- ✅ Interactive data exploration
- ✅ Prototyping workflows
- ✅ Educational demonstrations
- ✅ Testing dproc library features

---

## Future Improvements (If Continued)

To make this production-ready, would need:

1. **Testing:** Full test suite (unit, integration, e2e with CLI testing)
2. **UX:** Better error messages, progress bars, command suggestions
3. **Features:** Batch processing, watch mode, bundle diffs, auto-completion
4. **Reliability:** Graceful error handling, retry logic, recovery mechanisms
5. **Performance:** Parallel processing, streaming for large files, caching
6. **Documentation:** Man pages, detailed help text, video tutorials
7. **Distribution:** Homebrew/apt packages, auto-updates, telemetry
8. **CI/CD:** Automated testing, release pipeline, version management

---

## Contributing

Since this is a training project, contributions are welcome for learning purposes:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-command`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add new command'`)
5. Push to the branch (`git push origin feature/new-command`)
6. Open a Pull Request

**Please note:** This project is not actively maintained for production use.

---

## Support

For questions or issues:

- 📧 Email: [mdharwad@aganitha.ai](mailto:mdharwad@aganitha.ai)
- 💬 GitHub Issues: [github.com/mdharwad-acog/dproc-cli/issues](https://github.com/mdharwad-acog/dproc-cli/issues)
- 📚 Library Docs: [@aganitha/dproc](https://npm.aganitha.ai/@aganitha/dproc)

**Remember:** This is a training project - use responsibly for learning purposes only!

---

## Acknowledgments

Built using excellent CLI tools:

- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) - Interactive prompts
- [chalk](https://github.com/chalk/chalk) - Terminal styling
- [ora](https://github.com/sindresorhus/ora) - Elegant spinners
- [boxen](https://github.com/sindresorhus/boxen) - Terminal boxes
- [cli-table3](https://github.com/cli-table/cli-table3) - ASCII tables
- [keytar](https://github.com/atom/node-keytar) - Secure credential storage

Special thanks to the Aganitha training program.

---

**Repository:** https://github.com/mdharwad-acog/dproc-cli  
**NPM Package:** https://npm.aganitha.ai/@aganitha/dproc-cli  
**Core Library:** [@aganitha/dproc](https://npm.aganitha.ai/@aganitha/dproc)  
**Version:** 1.0.1 (Training Release)  
**Status:** 🎓 Educational / Not Production Ready  
**Last Updated:** December 1, 2025
