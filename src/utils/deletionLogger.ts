import {
  mkdir,
  appendFile,
  readFile,
  writeFile,
  rename,
} from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export const DELETION_LOG_DIR = '.backlog';
export const DELETION_LOG_FILE = 'deletions.log.jsonl';

export type DeletedCommentSnapshot = {
  id?: number;
  content?: string;
  createdUser?: { id?: number; userId?: string; name?: string } | null;
  created?: string;
  updated?: string;
};

export type DeletionLogEntry = {
  entryId: string;
  timestamp: string;
  action: string;
  issueIdOrKey: string | number;
  commentId: number;
  comment?: DeletedCommentSnapshot;
  exported: boolean;
  exportedAt?: string;
  exportedTo?: {
    issueIdOrKey: string | number;
    commentId: number;
  };
};

export type AppendDeletionLogInput = Omit<
  DeletionLogEntry,
  'entryId' | 'exported' | 'exportedAt' | 'exportedTo'
> & {
  entryId?: string;
};

export const resolveDeletionLogPath = (cwd: string = process.cwd()): string =>
  join(cwd, DELETION_LOG_DIR, DELETION_LOG_FILE);

export const appendDeletionLog = async (
  input: AppendDeletionLogInput,
  cwd: string = process.cwd()
): Promise<DeletionLogEntry> => {
  const dir = join(cwd, DELETION_LOG_DIR);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, DELETION_LOG_FILE);
  const entry: DeletionLogEntry = {
    entryId: input.entryId ?? randomUUID(),
    timestamp: input.timestamp,
    action: input.action,
    issueIdOrKey: input.issueIdOrKey,
    commentId: input.commentId,
    comment: input.comment,
    exported: false,
  };
  await appendFile(filePath, JSON.stringify(entry) + '\n', 'utf8');
  return entry;
};

export const readDeletionLogEntries = async (
  cwd: string = process.cwd()
): Promise<DeletionLogEntry[]> => {
  const filePath = resolveDeletionLogPath(cwd);
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (err) {
    if ((err as { code?: string }).code === 'ENOENT') return [];
    throw err;
  }
  return raw
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .flatMap((line, idx): DeletionLogEntry[] => {
      let parsed: Partial<DeletionLogEntry>;
      try {
        parsed = JSON.parse(line) as Partial<DeletionLogEntry>;
      } catch {
        return [];
      }
      return [
        {
          entryId: parsed.entryId ?? `legacy-${idx + 1}`,
          timestamp: parsed.timestamp ?? '',
          action: parsed.action ?? 'delete_issue_comment',
          issueIdOrKey: parsed.issueIdOrKey ?? '',
          commentId: parsed.commentId ?? 0,
          comment: parsed.comment,
          exported: parsed.exported ?? false,
          exportedAt: parsed.exportedAt,
          exportedTo: parsed.exportedTo,
        },
      ];
    });
};

export const writeDeletionLogEntries = async (
  entries: DeletionLogEntry[],
  cwd: string = process.cwd()
): Promise<void> => {
  const dir = join(cwd, DELETION_LOG_DIR);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, DELETION_LOG_FILE);
  const tmpPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  const body = entries.map((e) => JSON.stringify(e)).join('\n');
  await writeFile(tmpPath, body.length ? body + '\n' : '', 'utf8');
  await rename(tmpPath, filePath);
};

export const markEntriesExported = async (
  entryIds: string[],
  exportInfo: { issueIdOrKey: string | number; commentId: number },
  cwd: string = process.cwd()
): Promise<DeletionLogEntry[]> => {
  const all = await readDeletionLogEntries(cwd);
  const targets = new Set(entryIds);
  const exportedAt = new Date().toISOString();
  const updated = all.map((entry) =>
    targets.has(entry.entryId)
      ? {
          ...entry,
          exported: true,
          exportedAt,
          exportedTo: { ...exportInfo },
        }
      : entry
  );
  await writeDeletionLogEntries(updated, cwd);
  return updated.filter((e) => targets.has(e.entryId));
};
