#!/usr/bin/env node
// Copyright (c) 2025 Nulab inc.
// Licensed under the MIT License.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import * as backlogjs from 'backlog-js';
import { registerTools } from "./registerTools.js";
import { createTranslationHelper } from "./createTranslationHelper.js";
import { VERSION } from "./version.js"; // ← 相対パス注意！

dotenv.config();

const domain = process.env.BACKLOG_DOMAIN || ""
const backlog = new backlogjs.Backlog({ host: domain, apiKey: process.env.BACKLOG_API_KEY });

const useFields = resolveUseFields();

const server = new McpServer({
  name: "backlog",
  description: useFields ? `You can include only the fields you need using GraphQL-style syntax.
Start with the example above and customize freely.` : undefined,
  version: VERSION
});

const transHelper = createTranslationHelper()

const maxTokens = resolveMaxTokens(); 
// Register all tools
registerTools(server, backlog, transHelper, { useFields: useFields, maxTokens });

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

export function resolveMaxTokens(defaultValue = 50000): number {
  // Try CLI arg: --max-tokens=XXXXX
  const cliArg = process.argv.find(arg => arg.startsWith("--max-tokens="));
  if (cliArg) {
    const value = parseInt(cliArg.split("=")[1], 10);
    if (!isNaN(value)) return value;
  }

  // Try environment variable
  const env = process.env.MAX_TOKENS;
  if (env) {
    const value = parseInt(env, 10);
    if (!isNaN(value)) return value;
  }

  // Fallback to default
  return defaultValue;
}

export function resolveUseFields(): boolean {
  // 1. CLI優先（--optimize-response）
  if (process.argv.includes("--optimize-response")) {
    return true;
  }

  // 2. 環境変数での指定（OPTIMIZE_RESPONSE=true）
  const env = process.env.OPTIMIZE_RESPONSE?.toLowerCase();
  if (env === "true" || env === "1") {
    return true;
  }

  // 3. デフォルトは false
  return false;
}
