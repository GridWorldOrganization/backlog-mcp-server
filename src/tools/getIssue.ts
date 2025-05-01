import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from "../createTranslationHelper.js";
import { IssueSchema } from "../types/zod/backlogOutputDefinition.js";

const getIssueSchema = buildToolSchema(t => ({
  issueIdOrKey: z
    .union([z.string(), z.number()])
    .describe(t("TOOL_GET_ISSUE_ISSUE_ID_OR_KEY", "Issue ID or issue key")),
}));

export const getIssueTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getIssueSchema>, typeof IssueSchema["shape"]> => {
  return {
    name: "get_issue",
    description: t("TOOL_GET_ISSUE_DESCRIPTION", "Returns information about a specific issue"),
    outputSchema: IssueSchema,
    schema: z.object(getIssueSchema(t)),
    handler: async ({ issueIdOrKey }) => backlog.getIssue(issueIdOrKey),
  };
};
