/* eslint-disable @typescript-eslint/no-explicit-any */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Backlog } from 'backlog-js';
import { backlogErrorHandler } from "./backlog/backlogErrorHandler.js";
import { TranslationHelper } from "./createTranslationHelper.js";
import { composeToolHandler } from "./handlers/builders/composeToolHandler.js";
import { allTools } from "./tools/tools.js";
import { MCPOptions } from "./types/mcp.js";

export function registerTools(server: McpServer, backlog: Backlog, helper: TranslationHelper, options: MCPOptions) {
  const registered = new Set<string>();
  const {useFields, maxTokens} = options

  for (const tool of allTools(backlog, helper)) {
    if (registered.has(tool.name)) {
      throw new Error(`Duplicate tool name detected: "${tool.name}"`);
    }

    registered.add(tool.name);

    const handler = composeToolHandler(tool, {
      useFields,
      errorHandler: backlogErrorHandler,
      maxTokens
    });


    server.tool(tool.name, tool.description, tool.schema.shape, handler);
  }
}
