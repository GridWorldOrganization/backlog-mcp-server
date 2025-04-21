import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getWatchingListCountSchema = buildToolSchema(t => ({
  userId: z.number().describe(t("TOOL_GET_WATCHING_LIST_COUNT_USER_ID", "User ID")),
}));

export const getWatchingListCountTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getWatchingListCountSchema>, CallToolResult> => {
  return {
    name: "get_watching_list_count",
    description: t("TOOL_GET_WATCHING_LIST_COUNT_DESCRIPTION", "Returns count of watching items for a user"),
    schema: z.object(getWatchingListCountSchema(t)),
    handler: async ({ userId }) => 
      withErrorHandling(() => backlog.getWatchingListCount(userId))
  };
};
