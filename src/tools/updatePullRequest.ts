import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const updatePullRequestSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_UPDATE_PULL_REQUEST_PROJECT_ID_OR_KEY", "Project ID or project key")),
  repoIdOrName: z.string().describe(t("TOOL_UPDATE_PULL_REQUEST_REPO_ID_OR_NAME", "Repository ID or name")),
  number: z.number().describe(t("TOOL_UPDATE_PULL_REQUEST_NUMBER", "Pull request number")),
  summary: z.string().optional().describe(t("TOOL_UPDATE_PULL_REQUEST_SUMMARY", "Summary of the pull request")),
  description: z.string().optional().describe(t("TOOL_UPDATE_PULL_REQUEST_DESCRIPTION", "Description of the pull request")),
  issueId: z.number().optional().describe(t("TOOL_UPDATE_PULL_REQUEST_ISSUE_ID", "Issue ID to link")),
  assigneeId: z.number().optional().describe(t("TOOL_UPDATE_PULL_REQUEST_ASSIGNEE_ID", "User ID of the assignee")),
  notifiedUserId: z.array(z.number()).optional().describe(t("TOOL_UPDATE_PULL_REQUEST_NOTIFIED_USER_ID", "User IDs to notify")),
  statusId: z.number().optional().describe(t("TOOL_UPDATE_PULL_REQUEST_STATUS_ID", "Status ID")),
}));

export const updatePullRequestTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof updatePullRequestSchema>, CallToolResult> => {
  return {
    name: "update_pull_request",
    description: t("TOOL_UPDATE_PULL_REQUEST_DESCRIPTION", "Updates an existing pull request"),
    schema: z.object(updatePullRequestSchema(t)),
    handler: async ({ projectIdOrKey, repoIdOrName, number, ...params }) => 
      withErrorHandling(() => backlog.patchPullRequest(projectIdOrKey, repoIdOrName, number, params))
  };
};
