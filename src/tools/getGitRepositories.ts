import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getGitRepositoriesSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_GIT_REPOSITORIES_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));

export const getGitRepositoriesTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getGitRepositoriesSchema>, CallToolResult> => {
  return {
    name: "get_git_repositories",
    description: t("TOOL_GET_GIT_REPOSITORIES_DESCRIPTION", "Returns list of Git repositories for a project"),
    schema: z.object(getGitRepositoriesSchema(t)),
    handler: async ({ projectIdOrKey }) =>
      withErrorHandling(() => backlog.getGitRepositories(projectIdOrKey))
  };
};
