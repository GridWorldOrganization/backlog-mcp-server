import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { IssueCommentSchema } from '../types/zod/backlogOutputDefinition.js';
import { resolveIdOrKey } from '../utils/resolveIdOrKey.js';
import { appendDeletionLog } from '../utils/deletionLogger.js';

const deleteIssueCommentSchema = buildToolSchema((t) => ({
  issueId: z
    .number()
    .optional()
    .describe(
      t(
        'TOOL_DELETE_ISSUE_COMMENT_ID',
        'The numeric ID of the issue (e.g., 12345)'
      )
    ),
  issueKey: z
    .string()
    .optional()
    .describe(
      t(
        'TOOL_DELETE_ISSUE_COMMENT_KEY',
        "The key of the issue (e.g., 'PROJ-123')"
      )
    ),
  commentId: z
    .number()
    .describe(t('TOOL_DELETE_ISSUE_COMMENT_COMMENT_ID', 'Comment ID')),
}));

export const deleteIssueCommentTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof deleteIssueCommentSchema>,
  (typeof IssueCommentSchema)['shape']
> => {
  return {
    name: 'delete_issue_comment',
    description: t(
      'TOOL_DELETE_ISSUE_COMMENT_DESCRIPTION',
      'Deletes a comment from an issue. Records the deletion to .backlog/deletions.log.jsonl in the current working directory before calling the Backlog API.'
    ),
    schema: z.object(deleteIssueCommentSchema(t)),
    outputSchema: IssueCommentSchema,
    importantFields: ['id', 'content', 'createdUser', 'created', 'updated'],
    handler: async ({ issueId, issueKey, commentId }) => {
      const resolved = resolveIdOrKey(
        'issue',
        { id: issueId, key: issueKey },
        t
      );
      if (!resolved.ok) {
        throw resolved.error;
      }
      const issueIdOrKey = resolved.value;

      let snapshot: Awaited<ReturnType<Backlog['getIssueComment']>> | undefined;
      try {
        snapshot = await backlog.getIssueComment(issueIdOrKey, commentId);
      } catch {
        snapshot = undefined;
      }

      if (
        snapshot &&
        snapshot.content === null &&
        Array.isArray(snapshot.changeLog) &&
        snapshot.changeLog.length > 0
      ) {
        const count = snapshot.changeLog.length;
        throw new Error(
          t(
            'DELETE_ISSUE_COMMENT_SYSTEM_GENERATED_REFUSED',
            'Refusing to delete system-generated change-log comment'
          ) +
            ` (issue=${issueIdOrKey}, commentId=${commentId}, changeLog entries=${count}). ` +
            'Backlog API returns 200 for DELETE on this type but does NOT actually remove it; ' +
            'see docs/design/delete-issue-comment-status-change-behavior.md.'
        );
      }

      await appendDeletionLog({
        timestamp: new Date().toISOString(),
        action: 'delete_issue_comment',
        issueIdOrKey,
        commentId,
        comment: snapshot && {
          id: snapshot.id,
          content: snapshot.content,
          createdUser: snapshot.createdUser
            ? {
                id: snapshot.createdUser.id,
                userId: snapshot.createdUser.userId,
                name: snapshot.createdUser.name,
              }
            : null,
          created: snapshot.created,
          updated: snapshot.updated,
        },
      });

      return backlog.deleteIssueComment(issueIdOrKey, commentId);
    },
  };
};
