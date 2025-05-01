import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from "../createTranslationHelper.js";
import { PullRequestCountSchema } from "../types/zod/backlogOutputDefinition.js";

const getPullRequestsCountSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_PULL_REQUESTS_COUNT_PROJECT_ID_OR_KEY", "Project ID or project key")),
  repoIdOrName: z.string().describe(t("TOOL_GET_PULL_REQUESTS_COUNT_REPO_ID_OR_NAME", "Repository ID or name")),
  statusId: z.array(z.number()).optional().describe(t("TOOL_GET_PULL_REQUESTS_COUNT_STATUS_ID", "Status IDs")),
  assigneeId: z.array(z.number()).optional().describe(t("TOOL_GET_PULL_REQUESTS_COUNT_ASSIGNEE_ID", "Assignee user IDs")),
  issueId: z.array(z.number()).optional().describe(t("TOOL_GET_PULL_REQUESTS_COUNT_ISSUE_ID", "Issue IDs")),
  createdUserId: z.array(z.number()).optional().describe(t("TOOL_GET_PULL_REQUESTS_COUNT_CREATED_USER_ID", "Created user IDs")),
}));

export const getPullRequestsCountTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getPullRequestsCountSchema>, typeof PullRequestCountSchema["shape"]> => {
  return {
    name: "get_pull_requests_count",
    description: t("TOOL_GET_PULL_REQUESTS_COUNT_DESCRIPTION", "Returns count of pull requests for a repository"),
    schema: z.object(getPullRequestsCountSchema(t)),
    outputSchema: PullRequestCountSchema,
    handler: async ({ projectIdOrKey, repoIdOrName, ...params }) => backlog.getPullRequestsCount(projectIdOrKey, repoIdOrName, params)
  };
};
