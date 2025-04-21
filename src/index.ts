#!/usr/bin/env node
// Copyright (c) 2025 Nulab inc.
// Licensed under the MIT License.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import * as backlogjs from 'backlog-js';
import { registerTools } from "./registerTools.js";
import { createTranslationHelper } from "./createTranslationHelper.js";

dotenv.config();

const domain = process.env.BACKLOG_DOMAIN || ""
const backlog = new backlogjs.Backlog({ host: domain, apiKey: process.env.BACKLOG_API_KEY });

const server = new McpServer({
  name: "backlog",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

const transHelper = createTranslationHelper()

// Register all tools
registerTools(server, backlog, transHelper);

if (process.argv.includes("--export-translations")) {
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
