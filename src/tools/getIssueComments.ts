import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getIssueCommentsSchema = buildToolSchema(t => ({
  issueIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_ISSUE_COMMENTS_ISSUE_ID_OR_KEY", "Issue ID or issue key")),
  minId: z.number().optional().describe(t("TOOL_GET_ISSUE_COMMENTS_MIN_ID", "Minimum comment ID")),
  maxId: z.number().optional().describe(t("TOOL_GET_ISSUE_COMMENTS_MAX_ID", "Maximum comment ID")),
  count: z.number().optional().describe(t("TOOL_GET_ISSUE_COMMENTS_COUNT", "Number of comments to retrieve")),
  order: z.enum(["asc", "desc"]).optional().describe(t("TOOL_GET_ISSUE_COMMENTS_ORDER", "Sort order")),
}));

export const getIssueCommentsTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getIssueCommentsSchema>, CallToolResult> => {
  return {
    name: "get_issue_comments",
    description: t("TOOL_GET_ISSUE_COMMENTS_DESCRIPTION", "Returns list of comments for an issue"),
    schema: z.object(getIssueCommentsSchema(t)),
    handler: async ({ issueIdOrKey, ...params }) => 
      withErrorHandling(() => backlog.getIssueComments(issueIdOrKey, params))
  };
};
