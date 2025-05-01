import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from "../createTranslationHelper.js";
import { ProjectSchema } from "../types/zod/backlogOutputDefinition.js";

const deleteProjectSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_DELETE_PROJECT_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));

export const deleteProjectTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof deleteProjectSchema>, typeof ProjectSchema["shape"]> => {
  return {
    name: "delete_project",
    description: t("TOOL_DELETE_PROJECT_DESCRIPTION", "Deletes a project"),
    schema: z.object(deleteProjectSchema(t)),
    outputSchema: ProjectSchema,
    handler: async ({ projectIdOrKey }) => backlog.deleteProject(projectIdOrKey)
  };
};
