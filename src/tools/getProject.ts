import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getProjectSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_PROJECT_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));

export const getProjectTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getProjectSchema>, CallToolResult> => {
  return {
    name: "get_project",
    description: t("TOOL_GET_PROJECT_DESCRIPTION", "Returns information about a specific project"),
    schema: z.object(getProjectSchema(t)),
    handler: async ({ projectIdOrKey }) => 
      withErrorHandling(() => backlog.getProject(projectIdOrKey))
  };
};
