import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { FileInfoSchema } from '../types/zod/backlogOutputDefinition.js';

const uploadAttachmentSchema = buildToolSchema((t) => ({
  filePath: z
    .string()
    .describe(
      t(
        'TOOL_UPLOAD_ATTACHMENT_FILE_PATH',
        'Absolute path to the file to upload'
      )
    ),
  fileName: z
    .string()
    .optional()
    .describe(
      t(
        'TOOL_UPLOAD_ATTACHMENT_FILE_NAME',
        'Override the file name (default: basename of filePath)'
      )
    ),
}));

export const uploadAttachmentTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof uploadAttachmentSchema>,
  (typeof FileInfoSchema)['shape']
> => {
  return {
    name: 'upload_attachment',
    description: t(
      'TOOL_UPLOAD_ATTACHMENT_DESCRIPTION',
      'Uploads a file to Backlog space and returns the attachment ID. Use the returned id with add_wiki_attachments / add_issue_comment / etc.'
    ),
    schema: z.object(uploadAttachmentSchema(t)),
    outputSchema: FileInfoSchema,
    handler: async ({ filePath, fileName }) => {
      const buf = await readFile(filePath);
      const name = fileName ?? basename(filePath);
      const form = new FormData();
      form.append('file', new Blob([new Uint8Array(buf)]), name);
      return backlog.postSpaceAttachment(form);
    },
  };
};
