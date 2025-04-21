import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const deleteIssueSchema = buildToolSchema(t => ({
  issueIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_DELETE_ISSUE_ISSUE_ID_OR_KEY", "Issue ID or issue key")),
}));

export const deleteIssueTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof deleteIssueSchema>, CallToolResult> => {
  return {
    name: "delete_issue",
    description: t("TOOL_DELETE_ISSUE_DESCRIPTION", "Deletes an issue"),
    schema: z.object(deleteIssueSchema(t)),
    handler: async ({ issueIdOrKey }) => 
      withErrorHandling(() => backlog.deleteIssue(issueIdOrKey))
  };
};
