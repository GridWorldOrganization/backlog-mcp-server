import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { WikiFileInfoSchema } from '../types/zod/backlogOutputDefinition.js';

const addWikiAttachmentsSchema = buildToolSchema((t) => ({
  wikiId: z
    .union([z.string(), z.number()])
    .describe(t('TOOL_ADD_WIKI_ATTACHMENTS_ID', 'Wiki ID')),
  attachmentId: z
    .array(z.number())
    .describe(
      t(
        'TOOL_ADD_WIKI_ATTACHMENTS_ATTACHMENT_ID',
        'Attachment IDs to link (obtain by calling upload_attachment first)'
      )
    ),
}));

export const addWikiAttachmentsTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof addWikiAttachmentsSchema>,
  (typeof WikiFileInfoSchema)['shape']
> => {
  return {
    name: 'add_wiki_attachments',
    description: t(
      'TOOL_ADD_WIKI_ATTACHMENTS_DESCRIPTION',
      'Links uploaded attachments to a wiki page'
    ),
    schema: z.object(addWikiAttachmentsSchema(t)),
    outputSchema: WikiFileInfoSchema,
    handler: async ({ wikiId, attachmentId }) => {
      const id = typeof wikiId === 'string' ? parseInt(wikiId, 10) : wikiId;
      return backlog.postWikisAttachments(id, attachmentId);
    },
  };
};
