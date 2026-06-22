import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { PrioritySchema } from '../types/zod/backlogOutputDefinition.js';

const getPrioritiesSchema = buildToolSchema((_t) => ({}));

export const getPrioritiesTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof getPrioritiesSchema>,
  (typeof PrioritySchema)['shape']
> => {
  return {
    name: 'get_priorities',
    description: t(
      'TOOL_GET_PRIORITIES_DESCRIPTION',
      'Returns the list of priority levels (e.g. High, Normal, Low) with their IDs. Call this BEFORE add_issue to get a valid priorityId. This is a space-wide master list (no project parameter needed).'
    ),
    schema: z.object(getPrioritiesSchema(t)),
    outputSchema: PrioritySchema,
    handler: async () => backlog.getPriorities(),
  };
};
