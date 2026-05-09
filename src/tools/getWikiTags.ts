import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { TagSchema } from '../types/zod/backlogOutputDefinition.js';
import { resolveIdOrKey } from '../utils/resolveIdOrKey.js';

const getWikiTagsSchema = buildToolSchema((t) => ({
  projectId: z
    .number()
    .optional()
    .describe(t('TOOL_GET_WIKI_TAGS_PROJECT_ID', 'Project ID')),
  projectKey: z
    .string()
    .optional()
    .describe(t('TOOL_GET_WIKI_TAGS_PROJECT_KEY', 'Project key')),
}));

export const getWikiTagsTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof getWikiTagsSchema>,
  (typeof TagSchema)['shape']
> => {
  return {
    name: 'get_wiki_tags',
    description: t(
      'TOOL_GET_WIKI_TAGS_DESCRIPTION',
      'Returns list of tags used by wiki pages in a project'
    ),
    schema: z.object(getWikiTagsSchema(t)),
    outputSchema: TagSchema,
    handler: async ({ projectId, projectKey }) => {
      const result = resolveIdOrKey(
        'project',
        { id: projectId, key: projectKey },
        t
      );
      if (!result.ok) {
        throw result.error;
      }
      return backlog.getWikisTags(result.value);
    },
  };
};
