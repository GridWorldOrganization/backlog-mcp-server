import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getWatchingListItemsSchema = buildToolSchema(t => ({
  userId: z.number().describe(t("TOOL_GET_WATCHING_LIST_ITEMS_USER_ID", "User ID")),
}));

export const getWatchingListItemsTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getWatchingListItemsSchema>, CallToolResult> => {
  return {
    name: "get_watching_list_items",
    description: t("TOOL_GET_WATCHING_LIST_ITEMS_DESCRIPTION", "Returns list of watching items for a user"),
    schema: z.object(getWatchingListItemsSchema(t)),
    handler: async ({ userId }) => 
      withErrorHandling(() => backlog.getWatchingListItems(userId))
  };
};
