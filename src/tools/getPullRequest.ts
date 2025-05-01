import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from "../createTranslationHelper.js";
import { PullRequestSchema } from "../types/zod/backlogOutputDefinition.js";

const getPullRequestSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_PULL_REQUEST_PROJECT_ID_OR_KEY", "Project ID or project key")),
  repoIdOrName: z.string().describe(t("TOOL_GET_PULL_REQUEST_REPO_ID_OR_NAME", "Repository ID or name")),
  number: z.number().describe(t("TOOL_GET_PULL_REQUEST_NUMBER", "Pull request number")),
}));

export const getPullRequestTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getPullRequestSchema>, typeof PullRequestSchema["shape"]> => {
  return {
    name: "get_pull_request",
    description: t("TOOL_GET_PULL_REQUEST_DESCRIPTION", "Returns information about a specific pull request"),
    schema: z.object(getPullRequestSchema(t)),
    outputSchema: PullRequestSchema,
    handler: async ({ projectIdOrKey, repoIdOrName, number }) => backlog.getPullRequest(projectIdOrKey, repoIdOrName, number),
  };
};
