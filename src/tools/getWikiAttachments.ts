import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { WikiFileInfoSchema } from '../types/zod/backlogOutputDefinition.js';

const getWikiAttachmentsSchema = buildToolSchema((t) => ({
  wikiId: z
    .union([z.string(), z.number()])
    .describe(t('TOOL_GET_WIKI_ATTACHMENTS_ID', 'Wiki ID')),
}));

export const getWikiAttachmentsTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof getWikiAttachmentsSchema>,
  (typeof WikiFileInfoSchema)['shape']
> => {
  return {
    name: 'get_wiki_attachments',
    description: t(
      'TOOL_GET_WIKI_ATTACHMENTS_DESCRIPTION',
      'Returns the list of attachments on a wiki page'
    ),
    schema: z.object(getWikiAttachmentsSchema(t)),
    outputSchema: WikiFileInfoSchema,
    handler: async ({ wikiId }) => {
      const id = typeof wikiId === 'string' ? parseInt(wikiId, 10) : wikiId;
      return backlog.getWikisAttachments(id);
    },
  };
};
