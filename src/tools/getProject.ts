import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";
import { ProjectSchema } from "../backlogOutputDefinition.js";

const getProjectSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_PROJECT_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));

export const getProjectTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getProjectSchema>, typeof ProjectSchema["shape"]> => {
  return {
    name: "get_project",
    description: t("TOOL_GET_PROJECT_DESCRIPTION", "Returns information about a specific project"),
    schema: z.object(getProjectSchema(t)),
    outputSchema: ProjectSchema,
    handler: async ({ projectIdOrKey }) => backlog.getProject(projectIdOrKey),
  };
};
