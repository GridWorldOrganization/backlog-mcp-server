import { exportDeletedCommentsTool } from './exportDeletedComments.js';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Backlog } from 'backlog-js';
import { createTranslationHelper } from '../createTranslationHelper.js';
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DeletionLogEntry } from '../utils/deletionLogger.js';

const makeEntry = (
  overrides: Partial<DeletionLogEntry> = {}
): DeletionLogEntry => ({
  entryId: 'E-1',
  timestamp: '2026-04-18T00:00:00.000Z',
  action: 'delete_issue_comment',
  issueIdOrKey: 'SRC-1',
  commentId: 11,
  comment: {
    id: 11,
    content: 'first deleted',
    createdUser: { id: 1, userId: 'alice', name: 'Alice' },
    created: '2023-01-01T00:00:00Z',
    updated: '2023-01-01T00:00:00Z',
  },
  exported: false,
  ...overrides,
});

const writeLog = async (cwd: string, entries: DeletionLogEntry[]) => {
  const dir = join(cwd, '.backlog');
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, 'deletions.log.jsonl'),
    entries.map((e) => JSON.stringify(e)).join('\n') + '\n',
    'utf8'
  );
};

const readLog = async (cwd: string): Promise<DeletionLogEntry[]> => {
  const raw = await readFile(
    join(cwd, '.backlog', 'deletions.log.jsonl'),
    'utf8'
  );
  return raw
    .trim()
    .split('\n')
    .map((l) => JSON.parse(l) as DeletionLogEntry);
};

describe('exportDeletedCommentsTool', () => {
  const postedComment = {
    id: 9999,
    content: 'posted',
    changeLog: [],
    createdUser: {
      id: 1,
      userId: 'bot',
      name: 'Bot',
      roleType: 1,
      lang: 'en',
      mailAddress: 'bot@example.com',
      lastLoginTime: '2023-01-01T00:00:00Z',
    },
    created: '2026-04-18T03:00:00Z',
    updated: '2026-04-18T03:00:00Z',
    stars: [],
    notifications: [],
  };

  const mockBacklog: Partial<Backlog> = {
    postIssueComments: vi
      .fn<() => Promise<any>>()
      .mockResolvedValue(postedComment),
  };

  const tool = exportDeletedCommentsTool(
    mockBacklog as Backlog,
    createTranslationHelper()
  );

  let workDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    workDir = await mkdtemp(join(tmpdir(), 'backlog-mcp-export-'));
    process.chdir(workDir);
    vi.mocked(mockBacklog.postIssueComments!).mockClear();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(workDir, { recursive: true, force: true });
  });

  it('throws if no log file exists', async () => {
    await expect(tool.handler({ issueKey: 'DEST-1' })).rejects.toThrow(
      /No deletion log/
    );
  });

  it('throws if log has no unexported entries', async () => {
    await writeLog(workDir, [makeEntry({ entryId: 'E-1', exported: true })]);
    await expect(tool.handler({ issueKey: 'DEST-1' })).rejects.toThrow(
      /No unexported/
    );
  });

  it('exports all unexported entries when entryIds is omitted', async () => {
    await writeLog(workDir, [
      makeEntry({ entryId: 'E-1', commentId: 11 }),
      makeEntry({ entryId: 'E-2', commentId: 12, exported: true }),
      makeEntry({ entryId: 'E-3', commentId: 13 }),
    ]);

    const result = await tool.handler({ issueKey: 'DEST-1' });

    expect((result as { id: number }).id).toBe(9999);
    expect(mockBacklog.postIssueComments).toHaveBeenCalledTimes(1);
    const call = vi.mocked(mockBacklog.postIssueComments!).mock.calls[0];
    expect(call[0]).toBe('DEST-1');
    const content = (call[1] as { content: string }).content;
    expect(content).toContain('2件');
    expect(content).toContain('commentId=11');
    expect(content).toContain('commentId=13');
    expect(content).not.toContain('commentId=12');

    const after = await readLog(workDir);
    expect(after.find((e) => e.entryId === 'E-1')!.exported).toBe(true);
    expect(after.find((e) => e.entryId === 'E-2')!.exported).toBe(true);
    expect(after.find((e) => e.entryId === 'E-3')!.exported).toBe(true);
    expect(after.find((e) => e.entryId === 'E-1')!.exportedTo).toEqual({
      issueIdOrKey: 'DEST-1',
      commentId: 9999,
    });
  });

  it('exports only the specified entryIds', async () => {
    await writeLog(workDir, [
      makeEntry({ entryId: 'A', commentId: 1 }),
      makeEntry({ entryId: 'B', commentId: 2 }),
      makeEntry({ entryId: 'C', commentId: 3 }),
      makeEntry({ entryId: 'D', commentId: 4 }),
    ]);

    await tool.handler({
      issueKey: 'DEST-1',
      entryIds: ['A', 'C', 'D'],
    });

    const call = vi.mocked(mockBacklog.postIssueComments!).mock.calls[0];
    const content = (call[1] as { content: string }).content;
    expect(content).toContain('commentId=1');
    expect(content).toContain('commentId=3');
    expect(content).toContain('commentId=4');
    expect(content).not.toContain('commentId=2');

    const after = await readLog(workDir);
    expect(after.find((e) => e.entryId === 'A')!.exported).toBe(true);
    expect(after.find((e) => e.entryId === 'B')!.exported).toBe(false);
    expect(after.find((e) => e.entryId === 'C')!.exported).toBe(true);
    expect(after.find((e) => e.entryId === 'D')!.exported).toBe(true);
  });

  it('throws on unknown entryId without posting', async () => {
    await writeLog(workDir, [makeEntry({ entryId: 'A' })]);

    await expect(
      tool.handler({ issueKey: 'DEST-1', entryIds: ['A', 'ZZZ'] })
    ).rejects.toThrow(/unknown entryIds: ZZZ/);
    expect(mockBacklog.postIssueComments).not.toHaveBeenCalled();

    const after = await readLog(workDir);
    expect(after[0].exported).toBe(false);
  });

  it('throws on already-exported entryId without posting', async () => {
    await writeLog(workDir, [
      makeEntry({ entryId: 'A' }),
      makeEntry({ entryId: 'B', exported: true }),
    ]);

    await expect(
      tool.handler({ issueKey: 'DEST-1', entryIds: ['A', 'B'] })
    ).rejects.toThrow(/already exported entryIds: B/);
    expect(mockBacklog.postIssueComments).not.toHaveBeenCalled();
  });

  it('throws on duplicated entryIds', async () => {
    await writeLog(workDir, [makeEntry({ entryId: 'A' })]);

    await expect(
      tool.handler({ issueKey: 'DEST-1', entryIds: ['A', 'A'] })
    ).rejects.toThrow(/duplicated entryIds: A/);
    expect(mockBacklog.postIssueComments).not.toHaveBeenCalled();
  });

  it('throws if neither issueId nor issueKey is provided', async () => {
    await writeLog(workDir, [makeEntry()]);
    await expect(tool.handler({} as any)).rejects.toThrow(Error);
  });

  it('throws if entryIds is explicitly empty (distinct from omitted)', async () => {
    await writeLog(workDir, [makeEntry({ entryId: 'A' })]);
    await expect(
      tool.handler({ issueKey: 'DEST-1', entryIds: [] })
    ).rejects.toThrow(/empty/);
    expect(mockBacklog.postIssueComments).not.toHaveBeenCalled();
  });

  it('blockquote-prefixes the deleted comment content', async () => {
    await writeLog(workDir, [
      makeEntry({
        entryId: 'X',
        comment: {
          id: 1,
          content: '## Heading\n---\nbody text',
          createdUser: { id: 1, userId: 'u', name: 'U' },
          created: 'c',
          updated: 'u',
        },
      }),
    ]);

    await tool.handler({ issueKey: 'DEST-1' });
    const call = vi.mocked(mockBacklog.postIssueComments!).mock.calls[0];
    const content = (call[1] as { content: string }).content;
    expect(content).toContain('> ## Heading');
    expect(content).toContain('> ---');
    expect(content).toContain('> body text');
  });

  it('skips malformed JSON lines when reading the log', async () => {
    const dir = join(workDir, '.backlog');
    await mkdir(dir, { recursive: true });
    const valid = makeEntry({ entryId: 'A' });
    await writeFile(
      join(dir, 'deletions.log.jsonl'),
      JSON.stringify(valid) + '\n{this is not json}\n',
      'utf8'
    );

    await tool.handler({ issueKey: 'DEST-1' });
    const call = vi.mocked(mockBacklog.postIssueComments!).mock.calls[0];
    const content = (call[1] as { content: string }).content;
    expect(content).toContain('1件');
  });

  it('reports a clear reconciliation error when post succeeds but mark-exported fails', async () => {
    await writeLog(workDir, [makeEntry({ entryId: 'A', commentId: 7 })]);

    (mockBacklog.postIssueComments as any as ReturnType<typeof vi.fn>)
      .mockReset()
      .mockImplementationOnce(async () => {
        const backlogDir = join(workDir, '.backlog');
        await rm(backlogDir, { recursive: true, force: true });
        await writeFile(backlogDir, 'blocker', 'utf8');
        return postedComment;
      });

    await expect(tool.handler({ issueKey: 'DEST-1' })).rejects.toThrow(
      /Comment posted successfully.*commentId=9999/
    );

    await rm(join(workDir, '.backlog'), { force: true });
  });
});
