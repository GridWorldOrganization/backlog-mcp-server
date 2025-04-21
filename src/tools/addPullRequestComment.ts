import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const addPullRequestCommentSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_ADD_PULL_REQUEST_COMMENT_PROJECT_ID_OR_KEY", "Project ID or project key")),
  repoIdOrName: z.string().describe(t("TOOL_ADD_PULL_REQUEST_COMMENT_REPO_ID_OR_NAME", "Repository ID or name")),
  number: z.number().describe(t("TOOL_ADD_PULL_REQUEST_COMMENT_NUMBER", "Pull request number")),
  content: z.string().describe(t("TOOL_ADD_PULL_REQUEST_COMMENT_CONTENT", "Comment content")),
  notifiedUserId: z.array(z.number()).optional().describe(t("TOOL_ADD_PULL_REQUEST_COMMENT_NOTIFIED_USER_ID", "User IDs to notify")),
}));

export const addPullRequestCommentTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof addPullRequestCommentSchema>, CallToolResult> => {
  return {
    name: "add_pull_request_comment",
    description: t("TOOL_ADD_PULL_REQUEST_COMMENT_DESCRIPTION", "Adds a comment to a pull request"),
    schema: z.object(addPullRequestCommentSchema(t)),
    handler: async ({ projectIdOrKey, repoIdOrName, number, ...params }) => 
       withErrorHandling(() => backlog.postPullRequestComments(projectIdOrKey, repoIdOrName, number, params))
  }
};
