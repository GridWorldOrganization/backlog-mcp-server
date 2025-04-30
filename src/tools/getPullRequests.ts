import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";
import { PullRequestSchema } from "../backlogOutputDefinition.js";

const getPullRequestsSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_PULL_REQUESTS_PROJECT_ID_OR_KEY", "Project ID or project key")),
  repoIdOrName: z.string().describe(t("TOOL_GET_PULL_REQUESTS_REPO_ID_OR_NAME", "Repository ID or name")),
  statusId: z.array(z.number()).optional().describe(t("TOOL_GET_PULL_REQUESTS_STATUS_ID", "Status IDs")),
  assigneeId: z.array(z.number()).optional().describe(t("TOOL_GET_PULL_REQUESTS_ASSIGNEE_ID", "Assignee user IDs")),
  issueId: z.array(z.number()).optional().describe(t("TOOL_GET_PULL_REQUESTS_ISSUE_ID", "Issue IDs")),
  createdUserId: z.array(z.number()).optional().describe(t("TOOL_GET_PULL_REQUESTS_CREATED_USER_ID", "Created user IDs")),
  offset: z.number().optional().describe(t("TOOL_GET_PULL_REQUESTS_OFFSET", "Offset for pagination")),
  count: z.number().optional().describe(t("TOOL_GET_PULL_REQUESTS_COUNT", "Number of pull requests to retrieve")),
}));

export const getPullRequestsTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getPullRequestsSchema>, typeof PullRequestSchema["shape"]> => {
  return {
    name: "get_pull_requests",
    description: t("TOOL_GET_PULL_REQUESTS_DESCRIPTION", "Returns list of pull requests for a repository"),
    schema: z.object(getPullRequestsSchema(t)),
    outputSchema: PullRequestSchema,
    handler: async ({ projectIdOrKey, repoIdOrName, ...params }) => backlog.getPullRequests(projectIdOrKey, repoIdOrName, params)
  };
};
