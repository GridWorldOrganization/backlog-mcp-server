import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from "../createTranslationHelper.js";
import { IssueSchema } from "../types/zod/backlogOutputDefinition.js";

const getIssueSchema = buildToolSchema(t => ({
  issueIdOrKey: z
    // Accepts either an issue key (e.g., "HOME-148") or issue ID (e.g., "1234")
    // Must always be passed as a string, even if it's a numeric ID
    // This prevents LLMs from sending incorrectly typed inputs
    .string()
    .describe(t("TOOL_GET_ISSUE_ISSUE_ID_OR_KEY", "The issue key (e.g., 'HOME-999') or issue ID (e.g., '1234') as a string")),
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
