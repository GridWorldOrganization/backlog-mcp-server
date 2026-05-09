import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { IssueCommentSchema } from '../types/zod/backlogOutputDefinition.js';
import { resolveIdOrKey } from '../utils/resolveIdOrKey.js';
import {
  readDeletionLogEntries,
  markEntriesExported,
  type DeletionLogEntry,
} from '../utils/deletionLogger.js';

const exportDeletedCommentsSchema = buildToolSchema((t) => ({
  issueId: z
    .number()
    .optional()
    .describe(
      t(
        'TOOL_EXPORT_DELETED_COMMENTS_ID',
        'Target issue numeric ID where the summary comment will be posted'
      )
    ),
  issueKey: z
    .string()
    .optional()
    .describe(
      t(
        'TOOL_EXPORT_DELETED_COMMENTS_KEY',
        "Target issue key where the summary comment will be posted (e.g., 'PROJ-123')"
      )
    ),
  entryIds: z
    .array(z.string().min(1))
    .optional()
    .describe(
      t(
        'TOOL_EXPORT_DELETED_COMMENTS_ENTRY_IDS',
        'Log entry IDs to export. If omitted, all unexported entries are posted. If provided, every id must match an unexported entry — otherwise the call throws without posting.'
      )
    ),
}));

const renderEntry = (entry: DeletionLogEntry, index: number): string => {
  const header = `### ${index + 1}. ${entry.issueIdOrKey} / commentId=${entry.commentId}`;
  const meta: string[] = [];
  meta.push(`- entryId: \`${entry.entryId}\``);
  meta.push(`- 削除日時: ${entry.timestamp}`);
  if (entry.comment?.createdUser) {
    const u = entry.comment.createdUser;
    const label = [u.name, u.userId && `(${u.userId})`]
      .filter(Boolean)
      .join(' ');
    meta.push(`- 投稿者: ${label || '(unknown)'}`);
  }
  if (entry.comment?.created) {
    meta.push(`- 作成日時: ${entry.comment.created}`);
  }
  if (entry.comment?.updated) {
    meta.push(`- 更新日時: ${entry.comment.updated}`);
  }
  const rawBody =
    entry.comment?.content ?? '(削除時に本文を取得できませんでした)';
  const body = rawBody
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
  return `${header}\n${meta.join('\n')}\n\n${body}`;
};

const renderComment = (entries: DeletionLogEntry[]): string => {
  const intro = `## 削除済みコメント記録 (${entries.length}件)\n\n以下は \`.backlog/deletions.log.jsonl\` に記録された削除済みコメントの内容です。`;
  const body = entries.map(renderEntry).join('\n\n---\n\n');
  return `${intro}\n\n${body}`;
};

export const exportDeletedCommentsTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof exportDeletedCommentsSchema>,
  (typeof IssueCommentSchema)['shape']
> => {
  return {
    name: 'export_deleted_comments',
    description: t(
      'TOOL_EXPORT_DELETED_COMMENTS_DESCRIPTION',
      'Reads .backlog/deletions.log.jsonl and posts the selected (or all unexported) deletion records as a single new comment on the target issue. Marks the exported entries so they are not re-posted.'
    ),
    schema: z.object(exportDeletedCommentsSchema(t)),
    outputSchema: IssueCommentSchema,
    importantFields: ['id', 'content', 'createdUser', 'created'],
    handler: async ({ issueId, issueKey, entryIds }) => {
      const resolved = resolveIdOrKey(
        'issue',
        { id: issueId, key: issueKey },
        t
      );
      if (!resolved.ok) {
        throw resolved.error;
      }
      const targetIssue = resolved.value;

      const all = await readDeletionLogEntries();
      if (all.length === 0) {
        throw new Error(
          t(
            'EXPORT_DELETED_COMMENTS_EMPTY_LOG',
            'No deletion log found at .backlog/deletions.log.jsonl'
          )
        );
      }

      if (entryIds !== undefined && entryIds.length === 0) {
        throw new Error(
          t(
            'EXPORT_DELETED_COMMENTS_EMPTY_SELECTION',
            'entryIds was provided but empty — omit the argument to export all unexported entries, or pass at least one id'
          )
        );
      }

      let selected: DeletionLogEntry[];
      if (entryIds && entryIds.length > 0) {
        const byId = new Map(all.map((e) => [e.entryId, e]));
        const missing: string[] = [];
        const alreadyExported: string[] = [];
        const seen = new Set<string>();
        const duplicated: string[] = [];
        selected = [];
        for (const id of entryIds) {
          if (seen.has(id)) {
            duplicated.push(id);
            continue;
          }
          seen.add(id);
          const found = byId.get(id);
          if (!found) {
            missing.push(id);
            continue;
          }
          if (found.exported) {
            alreadyExported.push(id);
            continue;
          }
          selected.push(found);
        }
        const problems: string[] = [];
        if (missing.length > 0) {
          problems.push(`unknown entryIds: ${missing.join(', ')}`);
        }
        if (alreadyExported.length > 0) {
          problems.push(
            `already exported entryIds: ${alreadyExported.join(', ')}`
          );
        }
        if (duplicated.length > 0) {
          problems.push(`duplicated entryIds: ${duplicated.join(', ')}`);
        }
        if (problems.length > 0) {
          const prefix = t(
            'EXPORT_DELETED_COMMENTS_INVALID_IDS',
            'Invalid entryIds'
          );
          throw new Error(`${prefix} — ${problems.join('; ')}`);
        }
      } else {
        selected = all.filter((e) => !e.exported);
        if (selected.length === 0) {
          throw new Error(
            t(
              'EXPORT_DELETED_COMMENTS_NOTHING_TO_EXPORT',
              'No unexported deletion entries to export'
            )
          );
        }
      }

      const content = renderComment(selected);
      const posted = await backlog.postIssueComments(targetIssue, { content });

      try {
        await markEntriesExported(
          selected.map((e) => e.entryId),
          { issueIdOrKey: targetIssue, commentId: posted.id },
          process.cwd()
        );
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        throw new Error(
          `Comment posted successfully (issue=${targetIssue}, commentId=${posted.id}), but updating .backlog/deletions.log.jsonl failed: ${reason}. Re-running export without fixing the log will post the comment again — manually set "exported": true on entry IDs [${selected
            .map((e) => e.entryId)
            .join(', ')}] before retrying.`
        );
      }

      return posted;
    },
  };
};
