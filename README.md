# @aganitha/dproc

> 🎓 **Training Project** - AI-powered data processing engine built as a learning exercise

[![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)](https://npm.aganitha.ai/@aganitha/dproc)
[![Status](https://img.shields.io/badge/status-training-orange.svg)](https://npm.aganitha.ai/@aganitha/dproc)

## ⚠️ Important Disclaimer

**This is a training/learning project** developed to explore AI-powered data processing concepts. It is **NOT production-ready** and should be used for:

- ✅ Learning TypeScript architecture
- ✅ Experimenting with LLM integrations
- ✅ Prototyping data processing workflows
- ✅ Educational purposes and demos

**DO NOT use in production environments** without thorough testing, security audits, and additional development.

---

## What is dproc?

dproc is an educational data processing engine that demonstrates:

- Multi-format data ingestion (CSV, JSON, XML, Parquet)
- LLM integration for AI-powered reports (Gemini/OpenAI/DeepSeek)
- Natural language search over structured data
- Multi-format export (HTML, PDF, MDX)

**Built to learn:** Modern TypeScript patterns, AI SDK integration, keytar secure storage, Zod validation, and data pipeline architecture.

---

## Installation

Configure Aganitha registry (one-time)
npm config set @aganitha:registry https://npm.aganitha.ai/

Install from Aganitha registry
npm install @aganitha/dproc

or
pnpm add @aganitha/dproc

**Prerequisites:**

- Node.js >= 18.0.0
- npm registry configured for @aganitha scope
- Gemini/OpenAI/DeepSeek API key (for LLM features)

---

## Quick Start

```javascript
import {
  ConfigManager,
  ConnectorRegistry,
  BundleBuilder,
  SearchEngine,
} from "@aganitha/dproc";

// 1. Initialize (required) - auto-loads from keytar/env/config
ConfigManager.init({
  llm: {
    provider: "gemini",
    model: "gemini-1.5-flash",
    // apiKey auto-loaded from keytar or GEMINI_API_KEY
  },
});

// 2. Load data (auto-detects format)
const connector = ConnectorRegistry.getByFilePath("data.csv");
const records = await connector.read("data.csv");

// 3. Create bundle with stats
const bundle = BundleBuilder.create(records, {
  source: "my-data",
  format: "csv",
});

// 4. Search with natural language
const results = await SearchEngine.query(bundle, "Find all active users");
console.log(results.answer); // AI-generated answer
console.log(results.matchingRecords); // Filtered data
```

---

## Architecture

dproc is organized into 7 layers:

@aganitha/dproc
├── 1. Configuration Layer - LLM config, keytar, Zod validation
├── 2. Connectors Layer - CSV, JSON, XML, Parquet readers
├── 3. Bundles Layer - Normalized data with stats
├── 4. LLM Layer - AI SDK integration (Gemini/OpenAI/DeepSeek)
├── 5. Reports Layer - Template-driven report generation
├── 6. Search Layer - NL search with AI query planning
└── 7. Exports Layer - HTML, PDF, MDX output

Each layer is independent and can be used separately.

---

## Core Features

### 1. Data Connectors

Read multiple formats with automatic detection:

```javascript
import { ConnectorRegistry } from '@aganitha/dproc';

// Auto-detect format by extension
const connector = ConnectorRegistry.getByFilePath('data.csv');
const records = await connector.read('data.csv');

// Or use specific connector
import { CsvConnector, JsonConnector, XmlConnector, ParquetConnector } from '@aganitha/dproc';
const csvData = await new CsvConnector().read('file.csv');
const parquetData = await new ParquetConnector().read('file.parquet');

**Supported formats:**

- CSV/TSV (streaming)
- JSON (streaming)
- XML
- Parquet (streaming)

### 2. Bundles (Normalized Data)

Create universal data bundles with automatic statistics:

import { BundleBuilder, BundleLoader } from '@aganitha/dproc';

// Create bundle
const bundle = BundleBuilder.create(records, {
source: 'customer-data',
format: 'csv',
});

// Bundle includes:
console.log(bundle.metadata); // Source, format, record count
console.log(bundle.stats); // Field-level statistics
console.log(bundle.samples); // Sample records

// Save and load
await BundleLoader.save(bundle, 'bundle.json');
const loaded = await BundleLoader.load('bundle.json');

### 3. Natural Language Search

Search data using plain English:

import { SearchEngine } from '@aganitha/dproc';

const results = await SearchEngine.query(bundle, "Who is older than 30?");

console.log(results.answer); // AI-generated natural language answer
console.log(results.insights); // ["50% of users are over 30", ...]
console.log(results.stats); // { average_age: 32, count: 42 }
console.log(results.matchingRecords); // Filtered data
console.log(results.totalMatches); // 42
```

**How it works:**

1. LLM converts natural language → structured query
2. Query executor filters data (pure JavaScript)
3. LLM generates insights from results

### 4. AI-Powered Reports

Generate reports using YAML specs and templates:

```javascript
import { ReportEngine } from "@aganitha/dproc";

// Generate report
const report = await ReportEngine.generate(bundle, "report-spec.yaml");

console.log(report.content); // Markdown report
console.log(report.variables); // All resolved variables
console.log(report.metadata); // Generation metadata

// Save to file
await ReportEngine.generateAndSave(bundle, "report-spec.yaml", "output.md");
```

### 5. Multi-Format Export

Export reports to HTML, PDF, or MDX:

```javascript
import { HtmlExporter, PdfExporter, MdxExporter } from "@aganitha/dproc";

// Export to HTML
await new HtmlExporter().export("report.md", "report.html", {
  title: "My Report",
  includeBootstrap: true,
  includeTableOfContents: true,
});

// Export to PDF
await new PdfExporter().export("report.md", "report.pdf", {
  format: "A4",
  orientation: "portrait",
});

// Export to MDX (for Next.js docs)
await new MdxExporter().export("report.md", "report.mdx", {
  frontmatter: {
    title: "My Report",
    date: "2024-01-01",
  },
});
```

---

## Complete Example

```javascript
import {
  ConfigManager,
  ConnectorRegistry,
  BundleBuilder,
  SearchEngine,
  ReportEngine,
  HtmlExporter,
} from "@aganitha/dproc";

async function processData() {
  // 1. Configure (auto-loads keytar/env)
  ConfigManager.init({
    llm: {
      provider: "gemini",
      model: "gemini-1.5-flash",
    },
  });

  // 2. Ingest data
  const connector = ConnectorRegistry.getByFilePath("sales.csv");
  const records = await connector.read("sales.csv");

  // 3. Create bundle
  const bundle = BundleBuilder.create(records, {
    source: "sales-data",
    format: "csv",
  });

  // 4. Search
  const results = await SearchEngine.query(bundle, "What were sales in Q4?");
  console.log("Answer:", results.answer);
  console.log("Insights:", results.insights);

  // 5. Generate report
  await ReportEngine.generateAndSave(
    bundle,
    "quarterly-report.yaml",
    "q4-report.md"
  );

  // 6. Export to HTML
  await new HtmlExporter().export("q4-report.md", "q4-report.html");
}

processData().catch(console.error);
```

---

## Configuration

### Config Sources (Priority Order)

1. **keytar** (`apikey-gemini`, `apikey-openai`, `apikey-deepseek`)
2. **Environment** (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`)
3. **Project** (`dproc.config.yml`)
4. **Global** (`~/.dproc/config.yml`)

### LLM Providers

```javascript
// Gemini (Google)
ConfigManager.init({
  llm: {
    provider: "gemini",
    model: "gemini-1.5-flash",
    // apiKey auto-loaded
  },
});

// OpenAI
ConfigManager.init({
  llm: {
    provider: "openai",
    model: "gpt-4o-mini",
  },
});

// DeepSeek
ConfigManager.init({
  llm: {
    provider: "deepseek",
    model: "deepseek-chat",
  },
});
```

---

## CLI Companion

npm install -g @aganitha/dproc-cli

Workflow
dproc init # Setup
dproc ingest sales.csv # → bundle
dproc search bundle.json "top sales"
dproc report bundle.json spec.yaml

---

## Known Limitations

Since this is a **training project**, be aware of:

### ⚠️ Performance

- Loads entire dataset into memory
- No query optimization
- Not tested with datasets > 100K records

### ⚠️ Security

- Basic input validation only
- API keys stored in keytar (secure) or env
- No rate limiting

### ⚠️ Reliability

- Limited error handling
- No retry mechanisms
- Manual testing only

---

## Development Status

| Feature                  | Status     | Notes             |
| ------------------------ | ---------- | ----------------- |
| Connectors (CSV/JSON)    | ✅ Working | Streaming support |
| Connectors (XML/Parquet) | ⚠️ Basic   | Limited testing   |
| Bundles                  | ✅ Working | Full stats        |
| LLM Integration          | ✅ Working | All 3 providers   |
| Search                   | ✅ Working | NL → structured   |
| Reports                  | ⚠️ Basic   | YAML specs        |
| Exports                  | ⚠️ Basic   | HTML/PDF working  |

---

## Package Details

Published: https://npm.aganitha.ai/@aganitha/dproc
Version: 1.0.2
Node: >= 18.0.0
Type: module
Main: ./dist/index.js

**Key Dependencies:**

- `ai@5.0.102` (Vercel AI SDK)
- `zod@4.1.13` (Validation)
- `keytar@7.9.0` (Secure storage)
- `puppeteer@24.31.0` (PDF export)

---

**Repository:** https://github.com/mdharwad-acog/dproc  
**Version:** 1.0.2 (Training Release)  
**Status:** 🎓 Educational  
**Last Updated:** November 30, 2025
