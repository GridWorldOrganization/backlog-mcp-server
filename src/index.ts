#!/usr/bin/env node
// Copyright (c) 2025 Nulab inc.
// Licensed under the MIT License.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import * as backlogjs from 'backlog-js';
import { registerTools } from "./registerTools.js";
import { createTranslationHelper } from "./createTranslationHelper.js";
import { VERSION } from "./version.js"; 
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { default as env } from 'env-var';

dotenv.config();

const domain = env.get('BACKLOG_DOMAIN')
  .required()
  .asString();

const apiKey = env.get('BACKLOG_API_KEY')
  .required()
  .asString();

const backlog = new backlogjs.Backlog({ host: domain, apiKey: apiKey });

const argv = yargs(hideBin(process.argv))
  .option('max-tokens', {
    type: 'number',
    describe: 'Maximum number of tokens allowed in the response',
    default: env.get('MAX_TOKENS').default('50000').asIntPositive(),
  })
  .option('optimize-response', {
    type: 'boolean',
    describe: 'Enable GraphQL-style response optimization to include only requested fields',
    default: env.get('OPTIMIZE_RESPONSE').default('false').asBool(),
  })
  .option('export-translations', {
    type: 'boolean',
    describe: 'Export translations and exit',
    default: false, 
  })
  .parseSync();

const useFields = argv.optimizeResponse;

const server = new McpServer({
  name: "backlog",
  description: useFields ? `You can include only the fields you need using GraphQL-style syntax.
Start with the example above and customize freely.` : undefined,
  version: VERSION
});

const transHelper = createTranslationHelper()

const maxTokens = argv.maxTokens; 
console.log(maxTokens)
console.log(useFields)
// Register all tools
registerTools(server, backlog, transHelper, { useFields: useFields, maxTokens });

if (argv.exportTranslations) {
  const data = transHelper.dump();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Backlog MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
