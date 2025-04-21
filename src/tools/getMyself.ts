import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";

const getMyselfSchema = buildToolSchema(_t => ({}));

export const getMyselfTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getMyselfSchema>, CallToolResult> => {
  return {
    name: "get_myself",
    description: t("TOOL_GET_MYSELF_DESCRIPTION", "Returns information about the authenticated user"),
    schema: z.object(getMyselfSchema(t)),
    handler: async () => 
      withErrorHandling(() =>
        backlog.getMyself()
      )
  };
};
