import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";

const addIssueSchema = buildToolSchema(t => ({
  projectId: z.number().describe(t("TOOL_ADD_ISSUE_PROJECT_ID", "Project ID")),
  summary: z.string().describe(t("TOOL_ADD_ISSUE_SUMMARY", "Summary of the issue")),
  issueTypeId: z.number().describe(t("TOOL_ADD_ISSUE_ISSUE_TYPE_ID", "Issue type ID")),
  priorityId: z.number().describe(t("TOOL_ADD_ISSUE_PRIORITY_ID", "Priority ID")),
  description: z.string().optional().describe(t("TOOL_ADD_ISSUE_DESCRIPTION", "Detailed description of the issue")),
  startDate: z.string().optional().describe(t("TOOL_ADD_ISSUE_START_DATE", "Scheduled start date (yyyy-MM-dd)")),
  dueDate: z.string().optional().describe(t("TOOL_ADD_ISSUE_DUE_DATE", "Scheduled due date (yyyy-MM-dd)")),
  estimatedHours: z.number().optional().describe(t("TOOL_ADD_ISSUE_ESTIMATED_HOURS", "Estimated work hours")),
  actualHours: z.number().optional().describe(t("TOOL_ADD_ISSUE_ACTUAL_HOURS", "Actual work hours")),
  categoryId: z.array(z.number()).optional().describe(t("TOOL_ADD_ISSUE_CATEGORY_ID", "Category IDs")),
  versionId: z.array(z.number()).optional().describe(t("TOOL_ADD_ISSUE_VERSION_ID", "Version IDs")),
  milestoneId: z.array(z.number()).optional().describe(t("TOOL_ADD_ISSUE_MILESTONE_ID", "Milestone IDs")),
  assigneeId: z.number().optional().describe(t("TOOL_ADD_ISSUE_ASSIGNEE_ID", "User ID of the assignee")),
  notifiedUserId: z.array(z.number()).optional().describe(t("TOOL_ADD_ISSUE_NOTIFIED_USER_ID", "User IDs to notify")),
  attachmentId: z.array(z.number()).optional().describe(t("TOOL_ADD_ISSUE_ATTACHMENT_ID", "Attachment IDs")),
  parentIssueId: z.number().optional().describe(t("TOOL_ADD_ISSUE_PARENT_ISSUE_ID", "Parent issue ID")),
  customFieldId: z.array(z.number()).optional().describe(t("TOOL_ADD_ISSUE_CUSTOM_FIELD_ID", "Custom field IDs")),
  customFieldValue: z.array(z.string()).optional().describe(t("TOOL_ADD_ISSUE_CUSTOM_FIELD_VALUE", "Values for custom fields")),
}));

export const addIssueTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof addIssueSchema>, CallToolResult> => {
  return {
    name: "add_issue",
    description: t("TOOL_ADD_ISSUE_DESCRIPTION", "Creates a new issue in the specified project."),
    schema: z.object(addIssueSchema(t)),
    handler: async ({
      projectId,
      summary,
      issueTypeId,
      priorityId,
      description,
      startDate,
      dueDate,
      estimatedHours,
      actualHours,
      categoryId,
      versionId,
      milestoneId,
      assigneeId,
      notifiedUserId,
      attachmentId,
      parentIssueId,
      customFieldId,
      customFieldValue
    }) => 
      withErrorHandling(() =>
        backlog.postIssue({
          projectId,
          summary,
          issueTypeId,
          priorityId,
          description,
          startDate,
          dueDate,
          estimatedHours,
          actualHours,
          categoryId,
          versionId,
          milestoneId,
          assigneeId,
          notifiedUserId,
          attachmentId,
          parentIssueId,
          customFieldId,
          customFieldValue
        })
      )
  };
};
