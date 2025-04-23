import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";

const getSpaceSchema = buildToolSchema(_t => ({}));

export const getSpaceTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getSpaceSchema>, CallToolResult> => {
  return {
    name: "get_space",
    description: t("TOOL_GET_SPACE_DESCRIPTION", "Returns information about the Backlog space"),
    schema: z.object(getSpaceSchema(t)),
    handler: async () => 
      withErrorHandling(() =>
        backlog.getSpace()
      )
  };
};
