import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { WikiFileInfoSchema } from '../types/zod/backlogOutputDefinition.js';

const deleteWikiAttachmentSchema = buildToolSchema((t) => ({
  wikiId: z
    .union([z.string(), z.number()])
    .describe(t('TOOL_DELETE_WIKI_ATTACHMENT_WIKI_ID', 'Wiki ID')),
  attachmentId: z
    .number()
    .describe(
      t('TOOL_DELETE_WIKI_ATTACHMENT_ID', 'Attachment ID to remove')
    ),
}));

export const deleteWikiAttachmentTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof deleteWikiAttachmentSchema>,
  (typeof WikiFileInfoSchema)['shape']
> => {
  return {
    name: 'delete_wiki_attachment',
    description: t(
      'TOOL_DELETE_WIKI_ATTACHMENT_DESCRIPTION',
      'Removes an attachment from a wiki page'
    ),
    schema: z.object(deleteWikiAttachmentSchema(t)),
    outputSchema: WikiFileInfoSchema,
    handler: async ({ wikiId, attachmentId }) => {
      const id = typeof wikiId === 'string' ? parseInt(wikiId, 10) : wikiId;
      return backlog.deleteWikisAttachments(id, attachmentId);
    },
  };
};
