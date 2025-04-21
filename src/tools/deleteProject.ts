import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const deleteProjectSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_DELETE_PROJECT_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));

export const deleteProjectTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof deleteProjectSchema>, CallToolResult> => {
  return {
    name: "delete_project",
    description: t("TOOL_DELETE_PROJECT_DESCRIPTION", "Deletes a project"),
    schema: z.object(deleteProjectSchema(t)),
    handler: async ({ projectIdOrKey }) => 
      withErrorHandling(() => backlog.deleteProject(projectIdOrKey))
  };
};
