import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';

const addStarSchema = buildToolSchema((t) => ({
  issueId: z
    .number()
    .optional()
    .describe(t('TOOL_ADD_STAR_ISSUE_ID', 'Issue ID to add a star to')),
  commentId: z
    .number()
    .optional()
    .describe(
      t('TOOL_ADD_STAR_COMMENT_ID', 'Issue comment ID to add a star to')
    ),
  wikiId: z
    .number()
    .optional()
    .describe(t('TOOL_ADD_STAR_WIKI_ID', 'Wiki ID to add a star to')),
  pullRequestId: z
    .number()
    .optional()
    .describe(
      t('TOOL_ADD_STAR_PULL_REQUEST_ID', 'Pull request ID to add a star to')
    ),
  pullRequestCommentId: z
    .number()
    .optional()
    .describe(
      t(
        'TOOL_ADD_STAR_PULL_REQUEST_COMMENT_ID',
        'Pull request comment ID to add a star to'
      )
    ),
}));

export const AddStarResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const addStarTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof addStarSchema>,
  (typeof AddStarResultSchema)['shape']
> => {
  return {
    name: 'add_star',
    description: t(
      'TOOL_ADD_STAR_DESCRIPTION',
      'Adds a star to an issue, comment, wiki, pull request, or pull request comment. Exactly one target ID must be provided.'
    ),
    schema: z.object(addStarSchema(t)),
    outputSchema: AddStarResultSchema,
    handler: async (params) => {
      const targets = [
        params.issueId,
        params.commentId,
        params.wikiId,
        params.pullRequestId,
        params.pullRequestCommentId,
      ].filter((v) => v !== undefined);
      if (targets.length !== 1) {
        throw new Error(
          'Exactly one of issueId, commentId, wikiId, pullRequestId, or pullRequestCommentId must be provided.'
        );
      }
      await backlog.postStar(params);
      return { success: true, message: 'Star added' };
    },
  };
};
