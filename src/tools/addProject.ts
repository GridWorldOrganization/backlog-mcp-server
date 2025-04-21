import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const addProjectSchema = buildToolSchema(t => ({
  name: z.string().describe(t("TOOL_ADD_PROJECT_NAME", "Project name")),
  key: z.string().describe(t("TOOL_ADD_PROJECT_KEY", "Project key")),
  chartEnabled: z.boolean().optional().describe(t("TOOL_ADD_PROJECT_CHART_ENABLED", "Whether to enable chart (default: false)")),
  subtaskingEnabled: z.boolean().optional().describe(t("TOOL_ADD_PROJECT_SUBTASKING_ENABLED", "Whether to enable subtasking (default: false)")),
  projectLeaderCanEditProjectLeader: z.boolean().optional().describe(t("TOOL_ADD_PROJECT_LEADER_CAN_EDIT", "Whether project leaders can edit other project leaders (default: false)")),
  textFormattingRule: z.enum(["backlog", "markdown"]).optional().describe(t("TOOL_ADD_PROJECT_TEXT_FORMATTING", "Text formatting rule (default: 'backlog')")),
}));

export const addProjectTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof addProjectSchema>, CallToolResult> => {
  return {
    name: "add_project",
    description: t("TOOL_ADD_PROJECT_DESCRIPTION", "Creates a new project"),
    schema: z.object(addProjectSchema(t)),
    handler: async ({ name, key, chartEnabled, subtaskingEnabled, projectLeaderCanEditProjectLeader, textFormattingRule }) => 
      withErrorHandling(() => backlog.postProject({
        name,
        key,
        chartEnabled: chartEnabled ?? false,
        subtaskingEnabled: subtaskingEnabled ?? false,
        projectLeaderCanEditProjectLeader: projectLeaderCanEditProjectLeader ?? false,
        textFormattingRule: textFormattingRule ?? "backlog"
      }))
  };
};
