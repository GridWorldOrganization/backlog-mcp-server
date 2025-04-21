import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const resetUnreadNotificationCountSchema = buildToolSchema(_t => ({}));

export const resetUnreadNotificationCountTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof resetUnreadNotificationCountSchema>, CallToolResult> => {
  return {
    name: "reset_unread_notification_count",
    description: t("TOOL_RESET_UNREAD_NOTIFICATION_COUNT_DESCRIPTION", "Reset unread notification count"),
    schema: z.object(resetUnreadNotificationCountSchema(t)),
    handler: async () => 
      withErrorHandling(() => backlog.resetNotificationsMarkAsRead())
  };
};
