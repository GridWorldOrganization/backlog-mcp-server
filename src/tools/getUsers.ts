import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";

const getUsersSchema = buildToolSchema(_t => ({}));

export const getUsersTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getUsersSchema>, CallToolResult> => {
  return {
    name: "get_users",
    description: t("TOOL_GET_USERS_DESCRIPTION", "Returns list of users in the Backlog space"),
    schema: z.object(getUsersSchema(t)),
    handler: async () => 
      withErrorHandling(() =>
        backlog.getUsers()
      )
  };
};
