import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { WikiHistorySchema } from '../types/zod/backlogOutputDefinition.js';

const getWikiHistorySchema = buildToolSchema((t) => ({
  wikiId: z
    .union([z.string(), z.number()])
    .describe(t('TOOL_GET_WIKI_HISTORY_ID', 'Wiki ID')),
  minId: z
    .number()
    .optional()
    .describe(t('TOOL_GET_WIKI_HISTORY_MIN_ID', 'Minimum history ID')),
  maxId: z
    .number()
    .optional()
    .describe(t('TOOL_GET_WIKI_HISTORY_MAX_ID', 'Maximum history ID')),
  count: z
    .number()
    .optional()
    .describe(t('TOOL_GET_WIKI_HISTORY_COUNT', 'Number of entries (max 100)')),
  order: z
    .enum(['asc', 'desc'])
    .optional()
    .describe(t('TOOL_GET_WIKI_HISTORY_ORDER', 'Sort order (default desc)')),
}));

export const getWikiHistoryTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof getWikiHistorySchema>,
  (typeof WikiHistorySchema)['shape']
> => {
  return {
    name: 'get_wiki_history',
    description: t(
      'TOOL_GET_WIKI_HISTORY_DESCRIPTION',
      'Returns the edit history of a wiki page'
    ),
    schema: z.object(getWikiHistorySchema(t)),
    outputSchema: WikiHistorySchema,
    importantFields: ['version', 'name', 'createdUser', 'created'],
    handler: async ({ wikiId, ...params }) => {
      const id = typeof wikiId === 'string' ? parseInt(wikiId, 10) : wikiId;
      return backlog.getWikisHistory(id, params);
    },
  };
};
