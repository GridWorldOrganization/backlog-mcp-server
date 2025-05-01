import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from "../createTranslationHelper.js";
import { PullRequestCommentSchema } from "../types/zod/backlogOutputDefinition.js";

const updatePullRequestCommentSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_UPDATE_PULL_REQUEST_COMMENT_PROJECT_ID_OR_KEY", "Project ID or project key")),
  repoIdOrName: z.string().describe(t("TOOL_UPDATE_PULL_REQUEST_COMMENT_REPO_ID_OR_NAME", "Repository ID or name")),
  number: z.number().describe(t("TOOL_UPDATE_PULL_REQUEST_COMMENT_NUMBER", "Pull request number")),
  commentId: z.number().describe(t("TOOL_UPDATE_PULL_REQUEST_COMMENT_COMMENT_ID", "Comment ID")),
  content: z.string().describe(t("TOOL_UPDATE_PULL_REQUEST_COMMENT_CONTENT", "Comment content")),
}));

export const updatePullRequestCommentTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof updatePullRequestCommentSchema>, typeof PullRequestCommentSchema["shape"]> => {
  return {
    name: "update_pull_request_comment",
    description: t("TOOL_UPDATE_PULL_REQUEST_COMMENT_DESCRIPTION", "Updates a comment on a pull request"),
    schema: z.object(updatePullRequestCommentSchema(t)),
    outputSchema: PullRequestCommentSchema,
    importantFields: ["id", "content", "createdUser", "updated"],
    handler: async ({ projectIdOrKey, repoIdOrName, number, commentId, content }) => backlog.patchPullRequestComments(projectIdOrKey, repoIdOrName, number, commentId, { content })
  };
};
