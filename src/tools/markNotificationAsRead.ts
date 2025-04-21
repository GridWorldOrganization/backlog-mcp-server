import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const markNotificationAsReadSchema = buildToolSchema(t => ({
  id: z.number().describe(t("TOOL_MARK_NOTIFICATION_AS_READ_ID", "Notification ID to mark as read")),
}));

export const markNotificationAsReadTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof markNotificationAsReadSchema>, CallToolResult> => {
  return {
    name: "mark_notification_as_read",
    description: t("TOOL_MARK_NOTIFICATION_AS_READ_DESCRIPTION", "Mark a notification as read"),
    schema: z.object(markNotificationAsReadSchema(t)),
    handler: async ({ id }) => 
      withErrorHandling(() => {
        const output = JSON.stringify({ success: true, message: `Notification ${id} marked as read` }, null, 2)
        return backlog.markAsReadNotification(id).then(()=> output)
      })
  };
};
