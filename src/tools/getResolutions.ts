import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getResolutionsSchema = buildToolSchema(_t => ({}));

export const getResolutionsTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getResolutionsSchema>, CallToolResult> => {
  return {
    name: "get_resolutions",
    description: t("TOOL_GET_RESOLUTIONS_DESCRIPTION", "Returns list of issue resolutions"),
    schema: z.object(getResolutionsSchema(t)),
    handler: async () => 
      withErrorHandling(() => backlog.getResolutions())
  };
};
