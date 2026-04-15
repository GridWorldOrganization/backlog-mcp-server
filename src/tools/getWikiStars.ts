import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { StarSchema } from '../types/zod/backlogOutputDefinition.js';

const getWikiStarsSchema = buildToolSchema((t) => ({
  wikiId: z
    .union([z.string(), z.number()])
    .describe(t('TOOL_GET_WIKI_STARS_ID', 'Wiki ID')),
}));

export const getWikiStarsTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof getWikiStarsSchema>,
  (typeof StarSchema)['shape']
> => {
  return {
    name: 'get_wiki_stars',
    description: t(
      'TOOL_GET_WIKI_STARS_DESCRIPTION',
      'Returns the list of stars on a wiki page'
    ),
    schema: z.object(getWikiStarsSchema(t)),
    outputSchema: StarSchema,
    handler: async ({ wikiId }) => {
      const id = typeof wikiId === 'string' ? parseInt(wikiId, 10) : wikiId;
      return backlog.getWikisStars(id);
    },
  };
};
