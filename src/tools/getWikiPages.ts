import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from "../createTranslationHelper.js";
import { WikiListItemSchema } from "../types/zod/backlogOutputDefinition.js";

const getWikiPagesSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_WIKI_PAGES_PROJECT_ID_OR_KEY", "Project ID or project key")),
  keyword: z.string().optional().describe(t("TOOL_GET_WIKI_PAGES_KEYWORD", "Keyword to search for in Wiki pages")),
}));

export const getWikiPagesTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getWikiPagesSchema>, typeof WikiListItemSchema["shape"]> => {
  return {
    name: "get_wiki_pages",
    description: t("TOOL_GET_WIKI_PAGES_DESCRIPTION", "Returns list of Wiki pages"),
    schema: z.object(getWikiPagesSchema(t)),
    outputSchema: WikiListItemSchema,
    importantFields: ["projectId", "name", "tags"],
    handler: async ({ projectIdOrKey, keyword }) => backlog.getWikis({
      projectIdOrKey,
      keyword
    }),
  };
};
