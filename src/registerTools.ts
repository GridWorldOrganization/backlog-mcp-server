/* eslint-disable @typescript-eslint/no-explicit-any */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { allTools } from "./tools/tools.js";
import { Backlog } from 'backlog-js';
import { TranslationHelper } from "./createTranslationHelper.js";
import { withErrorHandlingT } from "./utils/withErrorHandling.js";
import { MCPOptions, ToolDefinition } from "./toolDefinition.js";
import { z } from "zod";
import { withPickingFields } from "./utils/withPickingFields.js";
import { generateFieldsDescription } from "./utils/generateFieldsDescription.js";

export function registerTools(server: McpServer, backlog: Backlog, helper: TranslationHelper, options: MCPOptions) {
  const registered = new Set<string>();
  const useFields = options.useFields ?? false;

  for (const tool of allTools(backlog, helper)) {
    if (registered.has(tool.name)) {
      throw new Error(`Duplicate tool name detected: "${tool.name}"`);
    }

    registered.add(tool.name);
    const wrappedHandler = wrapTool(tool, useFields);

    server.tool(tool.name, tool.description, tool.schema.shape, wrappedHandler);
  }
}

function wrapTool<T extends ToolDefinition<any, any>>(
  tool: T,
  useFields: boolean
) {
  type I = z.infer<T["schema"]>;
  type O = T extends ToolDefinition<any, any> ? any : never;

  const fieldsDescription = generateFieldsDescription(tool.outputSchema, (tool.importantFields as string[])?? [], tool.name);

  if(!useFields) {
    return withErrorHandlingT(tool.handler)
  }

  tool.schema.shape["fields"] = z.string().describe(fieldsDescription);
  
  const picked = withPickingFields<I, O>(tool.handler);
  return withErrorHandlingT(picked)
}
