import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from "../createTranslationHelper.js";
import { GitRepositorySchema } from "../types/zod/backlogOutputDefinition.js";
import { resolveIdOrKey } from "../utils/resolveIdOrKey.js";

const getGitRepositorySchema = buildToolSchema(t => ({
  projectId: z
    .number()
    .optional()
    .describe(
      t(
        "TOOL_GET_GIT_REPOSITORY_PROJECT_ID",
        "The numeric ID of the project (e.g., 12345)"
      )
    ),
  projectKey: z
    .string()
    .optional()
    .describe(
      t(
        "TOOL_GET_GIT_REPOSITORY_PROJECT_KEY",
        "The key of the project (e.g., 'PROJECT')"
      )
    ),
  repoIdOrName: z.string().describe(t("TOOL_GET_GIT_REPOSITORY_REPO_ID_OR_NAME", "Repository ID or name")),
}));

export const getGitRepositoryTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getGitRepositorySchema>, typeof GitRepositorySchema["shape"]> => {
  return {
    name: "get_git_repository",
    description: t("TOOL_GET_GIT_REPOSITORY_DESCRIPTION", "Returns information about a specific Git repository"),
    schema: z.object(getGitRepositorySchema(t)),
    outputSchema: GitRepositorySchema,
    handler: async ({ projectId, projectKey, repoIdOrName }) => {
      const result = resolveIdOrKey("git", { id: projectId, key: projectKey }, t);
      if (!result.ok) {
        throw result.error;
      }
      return backlog.getGitRepository(result.value, repoIdOrName)
    }
  };
};
