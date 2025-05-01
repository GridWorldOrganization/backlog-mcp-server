import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from "../createTranslationHelper.js";
import { IssueTypeSchema } from "../types/zod/backlogOutputDefinition.js";

const getIssueTypesSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_ISSUE_TYPES_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));

export const getIssueTypesTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getIssueTypesSchema>, typeof IssueTypeSchema["shape"]> => {
  return {
    name: "get_issue_types",
    description: t("TOOL_GET_ISSUE_TYPES_DESCRIPTION", "Returns list of issue types for a project"),
    schema: z.object(getIssueTypesSchema(t)),
    outputSchema: IssueTypeSchema,
    importantFields: ["id", "name"],
    handler: async ({projectIdOrKey}) => backlog.getIssueTypes(projectIdOrKey),
  };
};
