import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { ResolutionSchema } from '../types/zod/backlogOutputDefinition.js';

const getResolutionsSchema = buildToolSchema((_t) => ({}));

export const getResolutionsTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof getResolutionsSchema>,
  (typeof ResolutionSchema)['shape']
> => {
  return {
    name: 'get_resolutions',
    description: t(
      'TOOL_GET_RESOLUTIONS_DESCRIPTION',
      'Returns the list of resolution statuses (e.g. Fixed, Won\'t Fix, Duplicate) with their IDs. Used with update_issue to set resolutionId when closing an issue. Space-wide master list.'
    ),
    schema: z.object(getResolutionsSchema(t)),
    outputSchema: ResolutionSchema,
    handler: async () => backlog.getResolutions(),
  };
};
