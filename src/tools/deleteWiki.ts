import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { WikiSchema } from '../types/zod/backlogOutputDefinition.js';

const deleteWikiSchema = buildToolSchema((t) => ({
  wikiId: z
    .union([z.string(), z.number()])
    .describe(t('TOOL_DELETE_WIKI_ID', 'Wiki ID')),
  mailNotify: z
    .boolean()
    .optional()
    .describe(
      t(
        'TOOL_DELETE_WIKI_MAIL_NOTIFY',
        'Whether to send notification emails (default: false)'
      )
    ),
}));

export const deleteWikiTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof deleteWikiSchema>,
  (typeof WikiSchema)['shape']
> => {
  return {
    name: 'delete_wiki',
    description: t('TOOL_DELETE_WIKI_DESCRIPTION', 'Deletes a wiki page'),
    schema: z.object(deleteWikiSchema(t)),
    outputSchema: WikiSchema,
    importantFields: ['id', 'name'],
    handler: async ({ wikiId, mailNotify }) => {
      const id = typeof wikiId === 'string' ? parseInt(wikiId, 10) : wikiId;
      return backlog.deleteWiki(id, mailNotify ?? false);
    },
  };
};
