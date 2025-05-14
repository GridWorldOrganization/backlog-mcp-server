import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from "../createTranslationHelper.js";
import { PullRequestCommentSchema } from "../types/zod/backlogOutputDefinition.js";
import { resolveIdOrKey } from "../utils/resolveIdOrKey.js";

const addPullRequestCommentSchema = buildToolSchema(t => ({
  projectId: z
    .number()
    .optional()
    .describe(
      t(
        "TOOL_ADD_PULL_REQUEST_COMMENT_PROJECT_ID",
        "The numeric ID of the project (e.g., 12345)"
      )
    ),
  projectKey: z
    .string()
    .optional()
    .describe(
      t(
        "TOOL_ADD_PULL_REQUEST_COMMENT_PROJECT_KEY",
        "The key of the project (e.g., 'PROJECT')"
      )
    ),
  repoIdOrName: z.string().describe(t("TOOL_ADD_PULL_REQUEST_COMMENT_REPO_ID_OR_NAME", "Repository ID or name")),
  number: z.number().describe(t("TOOL_ADD_PULL_REQUEST_COMMENT_NUMBER", "Pull request number")),
  content: z.string().describe(t("TOOL_ADD_PULL_REQUEST_COMMENT_CONTENT", "Comment content")),
  notifiedUserId: z.array(z.number()).optional().describe(t("TOOL_ADD_PULL_REQUEST_COMMENT_NOTIFIED_USER_ID", "User IDs to notify")),
}));

export const addPullRequestCommentTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof addPullRequestCommentSchema>, typeof PullRequestCommentSchema["shape"]> => {
  return {
    name: "add_pull_request_comment",
    description: t("TOOL_ADD_PULL_REQUEST_COMMENT_DESCRIPTION", "Adds a comment to a pull request"),
    schema: z.object(addPullRequestCommentSchema(t)),
    outputSchema: PullRequestCommentSchema,
    importantFields: ["id", "content", "createdUser"],
    handler: async ({ projectId, projectKey, repoIdOrName, number, ...params }) => {
      const result = resolveIdOrKey("pullRequest", { id: projectId, key: projectKey }, t);
      if (!result.ok) {
        throw result.error;
      }
      return backlog.postPullRequestComments(result.value, repoIdOrName, number, params)
    }
  }
};
