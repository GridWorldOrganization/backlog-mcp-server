import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";
import { ProjectSchema } from "../backlogOutputDefinition.js";

const updateProjectSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_UPDATE_PROJECT_PROJECT_ID_OR_KEY", "Project ID or project key")),
  name: z.string().optional().describe(t("TOOL_UPDATE_PROJECT_NAME", "Project name")),
  key: z.string().optional().describe(t("TOOL_UPDATE_PROJECT_KEY", "Project key")),
  chartEnabled: z.boolean().optional().describe(t("TOOL_UPDATE_PROJECT_CHART_ENABLED", "Whether to enable chart")),
  subtaskingEnabled: z.boolean().optional().describe(t("TOOL_UPDATE_PROJECT_SUBTASKING_ENABLED", "Whether to enable subtasking")),
  projectLeaderCanEditProjectLeader: z.boolean().optional().describe(t("TOOL_UPDATE_PROJECT_LEADER_CAN_EDIT", "Whether project leaders can edit other project leaders")),
  textFormattingRule: z.enum(["backlog", "markdown"]).optional().describe(t("TOOL_UPDATE_PROJECT_TEXT_FORMATTING", "Text formatting rule")),
  archived: z.boolean().optional().describe(t("TOOL_UPDATE_PROJECT_ARCHIVED", "Whether to archive the project")),
}));

export const updateProjectTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof updateProjectSchema>, typeof ProjectSchema["shape"]> => {
  return {
    name: "update_project",
    description: t("TOOL_UPDATE_PROJECT_DESCRIPTION", "Updates an existing project"),
    schema: z.object(updateProjectSchema(t)),
    outputSchema: ProjectSchema,
    handler: async ({ projectIdOrKey, name, key, chartEnabled, subtaskingEnabled, projectLeaderCanEditProjectLeader, textFormattingRule, archived }) =>
     backlog.patchProject(projectIdOrKey, {
        name,
        key,
        chartEnabled,
        subtaskingEnabled,
        projectLeaderCanEditProjectLeader,
        textFormattingRule,
        archived
      })
  };
};
