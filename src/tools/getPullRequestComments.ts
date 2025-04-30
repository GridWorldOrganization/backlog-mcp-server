import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";
import { PullRequestCommentSchema } from "../backlogOutputDefinition.js";

const getPullRequestCommentsSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_PULL_REQUEST_COMMENTS_PROJECT_ID_OR_KEY", "Project ID or project key")),
  repoIdOrName: z.string().describe(t("TOOL_GET_PULL_REQUEST_COMMENTS_REPO_ID_OR_NAME", "Repository ID or name")),
  number: z.number().describe(t("TOOL_GET_PULL_REQUEST_COMMENTS_NUMBER", "Pull request number")),
  minId: z.number().optional().describe(t("TOOL_GET_PULL_REQUEST_COMMENTS_MIN_ID", "Minimum comment ID")),
  maxId: z.number().optional().describe(t("TOOL_GET_PULL_REQUEST_COMMENTS_MAX_ID", "Maximum comment ID")),
  count: z.number().optional().describe(t("TOOL_GET_PULL_REQUEST_COMMENTS_COUNT", "Number of comments to retrieve")),
  order: z.enum(["asc", "desc"]).optional().describe(t("TOOL_GET_PULL_REQUEST_COMMENTS_ORDER", "Sort order")),
}));

export const getPullRequestCommentsTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getPullRequestCommentsSchema>, typeof PullRequestCommentSchema["shape"]> => {
  return {
    name: "get_pull_request_comments",
    description: t("TOOL_GET_PULL_REQUEST_COMMENTS_DESCRIPTION", "Returns list of comments for a pull request"),
    schema: z.object(getPullRequestCommentsSchema(t)),
    outputSchema: PullRequestCommentSchema,
    handler: async ({ projectIdOrKey, repoIdOrName, number, ...params }) => backlog.getPullRequestComments(projectIdOrKey, repoIdOrName, number, params)
  };
};
