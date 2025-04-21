import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const addPullRequestSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_ADD_PULL_REQUEST_PROJECT_ID_OR_KEY", "Project ID or project key")),
  repoIdOrName: z.string().describe(t("TOOL_ADD_PULL_REQUEST_REPO_ID_OR_NAME", "Repository ID or name")),
  summary: z.string().describe(t("TOOL_ADD_PULL_REQUEST_SUMMARY", "Summary of the pull request")),
  description: z.string().describe(t("TOOL_ADD_PULL_REQUEST_DESCRIPTION", "Description of the pull request")),
  base: z.string().describe(t("TOOL_ADD_PULL_REQUEST_BASE", "Base branch name")),
  branch: z.string().describe(t("TOOL_ADD_PULL_REQUEST_BRANCH", "Branch name to merge")),
  issueId: z.number().optional().describe(t("TOOL_ADD_PULL_REQUEST_ISSUE_ID", "Issue ID to link")),
  assigneeId: z.number().optional().describe(t("TOOL_ADD_PULL_REQUEST_ASSIGNEE_ID", "User ID of the assignee")),
  notifiedUserId: z.array(z.number()).optional().describe(t("TOOL_ADD_PULL_REQUEST_NOTIFIED_USER_ID", "User IDs to notify")),
}));

export const addPullRequestTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof addPullRequestSchema>, CallToolResult> => {
  return {
    name: "add_pull_request",
    description: t("TOOL_ADD_PULL_REQUEST_DESCRIPTION", "Creates a new pull request"),
    schema: z.object(addPullRequestSchema(t)),
    handler: async ({ projectIdOrKey, repoIdOrName, ...params }) =>
      withErrorHandling(() =>
        backlog.postPullRequest(projectIdOrKey, repoIdOrName, params)
      )
  };
};
