import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";

const getProjectListSchema = buildToolSchema(t => ({
  archived: z
    .boolean()
    .optional()
    .describe(t("TOOL_GET_PROJECT_LIST_ARCHIVED", "For unspecified parameters, this form returns all projects. For ‘false’ parameters, it returns unarchived projects. For ‘true’ parameters, it returns archived projects.")),
  all: z
    .boolean()
    .optional()
    .describe(t("TOOL_GET_PROJECT_LIST_ALL", "Only applies to administrators. If ‘true,’ it returns all projects. If ‘false,’ it returns only projects they have joined.")),
}))

export const getProjectListTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getProjectListSchema>, CallToolResult> => {
  return {
    name: "get_project_list",
    description: t("TOOL_GET_PROJECT_LIST_DESCRIPTION", "Returns list of projects"),
    schema: z.object(getProjectListSchema(t)),
    handler: async ({ archived, all }) => 
      withErrorHandling(() =>
        backlog.getProjects({ archived, all })
      )
  }
}