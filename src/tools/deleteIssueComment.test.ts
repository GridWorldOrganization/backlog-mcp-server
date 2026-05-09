import { deleteIssueCommentTool } from './deleteIssueComment.js';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Backlog } from 'backlog-js';
import { createTranslationHelper } from '../createTranslationHelper.js';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('deleteIssueCommentTool', () => {
  const sampleComment = {
    id: 42,
    content: 'Original comment text',
    changeLog: [],
    createdUser: {
      id: 1,
      userId: 'user1',
      name: 'User One',
      roleType: 1,
      lang: 'en',
      mailAddress: 'user1@example.com',
      lastLoginTime: '2023-01-01T00:00:00Z',
    },
    created: '2023-01-01T00:00:00Z',
    updated: '2023-01-02T00:00:00Z',
    stars: [],
    notifications: [],
  };

  const mockBacklog: Partial<Backlog> = {
    getIssueComment: vi
      .fn<() => Promise<any>>()
      .mockResolvedValue(sampleComment),
    deleteIssueComment: vi
      .fn<() => Promise<any>>()
      .mockResolvedValue(sampleComment),
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = deleteIssueCommentTool(
    mockBacklog as Backlog,
    mockTranslationHelper
  );

  let workDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    workDir = await mkdtemp(join(tmpdir(), 'backlog-mcp-test-'));
    process.chdir(workDir);
    vi.mocked(mockBacklog.getIssueComment!).mockClear();
    vi.mocked(mockBacklog.deleteIssueComment!).mockClear();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(workDir, { recursive: true, force: true });
  });

  it('returns deleted comment', async () => {
    const result = await tool.handler({
      issueKey: 'TEST-1',
      commentId: 42,
    });
    expect(result).toHaveProperty('id', 42);
    expect(result).toHaveProperty('content', 'Original comment text');
  });

  it('calls backlog.deleteIssueComment with issueKey', async () => {
    await tool.handler({ issueKey: 'TEST-1', commentId: 42 });
    expect(mockBacklog.deleteIssueComment).toHaveBeenCalledWith('TEST-1', 42);
  });

  it('calls backlog.deleteIssueComment with issueId', async () => {
    await tool.handler({ issueId: 100, commentId: 42 });
    expect(mockBacklog.deleteIssueComment).toHaveBeenCalledWith(100, 42);
  });

  it('throws if neither issueId nor issueKey is provided', async () => {
    await expect(tool.handler({ commentId: 42 } as any)).rejects.toThrow(Error);
  });

  it('writes a JSONL entry to .backlog/deletions.log.jsonl before deletion', async () => {
    await tool.handler({ issueKey: 'TEST-1', commentId: 42 });

    const logPath = join(workDir, '.backlog', 'deletions.log.jsonl');
    const contents = await readFile(logPath, 'utf8');
    const lines = contents.trim().split('\n');
    expect(lines).toHaveLength(1);

    const entry = JSON.parse(lines[0]);
    expect(entry.action).toBe('delete_issue_comment');
    expect(entry.issueIdOrKey).toBe('TEST-1');
    expect(entry.commentId).toBe(42);
    expect(entry.comment.content).toBe('Original comment text');
    expect(entry.comment.createdUser.userId).toBe('user1');
    expect(typeof entry.timestamp).toBe('string');
  });

  it('logs and deletes even if getIssueComment fails', async () => {
    vi.mocked(mockBacklog.getIssueComment!).mockRejectedValueOnce(
      new Error('not found')
    );

    await tool.handler({ issueKey: 'TEST-1', commentId: 42 });

    const logPath = join(workDir, '.backlog', 'deletions.log.jsonl');
    const contents = await readFile(logPath, 'utf8');
    const entry = JSON.parse(contents.trim());
    expect(entry.commentId).toBe(42);
    expect(entry.comment).toBeUndefined();
    expect(mockBacklog.deleteIssueComment).toHaveBeenCalledWith('TEST-1', 42);
  });

  it('refuses to delete system-generated change-log comments (content=null + changeLog)', async () => {
    vi.mocked(mockBacklog.getIssueComment!).mockResolvedValueOnce({
      id: 100,
      content: null,
      changeLog: [
        {
          field: 'status',
          newValue: '外部レビュー完了',
          originalValue: '処理中',
          attachmentInfo: null,
          attributeInfo: null,
          notificationInfo: null,
        },
      ],
      createdUser: sampleComment.createdUser,
      created: sampleComment.created,
      updated: sampleComment.updated,
      stars: [],
      notifications: [],
    } as any);

    await expect(
      tool.handler({ issueKey: 'TEST-1', commentId: 100 })
    ).rejects.toThrow(/system-generated change-log comment/);

    expect(mockBacklog.deleteIssueComment).not.toHaveBeenCalled();

    const logPath = join(workDir, '.backlog', 'deletions.log.jsonl');
    await expect(readFile(logPath, 'utf8')).rejects.toThrow();
  });

  it('appends multiple entries across calls', async () => {
    await tool.handler({ issueKey: 'TEST-1', commentId: 1 });
    await tool.handler({ issueKey: 'TEST-1', commentId: 2 });

    const logPath = join(workDir, '.backlog', 'deletions.log.jsonl');
    const contents = await readFile(logPath, 'utf8');
    const lines = contents.trim().split('\n');
    expect(lines).toHaveLength(2);
  });
});
