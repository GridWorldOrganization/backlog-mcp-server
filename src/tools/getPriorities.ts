import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "../utils/withErrorHandling.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getPrioritiesSchema = buildToolSchema(_t => ({}));

export const getPrioritiesTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getPrioritiesSchema>, CallToolResult> => {
  return {
    name: "get_priorities",
    description: t("TOOL_GET_PRIORITIES_DESCRIPTION", "Returns list of priorities"),
    schema: z.object(getPrioritiesSchema(t)),
    handler: async () => 
      withErrorHandling(() => backlog.getPriorities())
  };
};
