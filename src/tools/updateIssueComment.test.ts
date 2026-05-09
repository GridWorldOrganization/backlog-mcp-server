import { updateIssueCommentTool } from './updateIssueComment.js';
import { vi, describe, it, expect } from 'vitest';
import type { Backlog } from 'backlog-js';
import { createTranslationHelper } from '../createTranslationHelper.js';

describe('updateIssueCommentTool', () => {
  const mockBacklog: Partial<Backlog> = {
    patchIssueComment: vi.fn<() => Promise<any>>().mockResolvedValue({
      id: 1,
      content: 'Updated comment content',
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
    }),
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = updateIssueCommentTool(
    mockBacklog as Backlog,
    mockTranslationHelper
  );

  it('returns updated comment', async () => {
    const result = await tool.handler({
      issueKey: 'TEST-1',
      commentId: 1,
      content: 'Updated comment content',
    });

    expect(result).toHaveProperty('content', 'Updated comment content');
    expect(result).toHaveProperty('id', 1);
  });

  it('calls backlog.patchIssueComment with correct params when using issueKey', async () => {
    await tool.handler({
      issueKey: 'TEST-1',
      commentId: 1,
      content: 'Updated comment content',
    });

    expect(mockBacklog.patchIssueComment).toHaveBeenCalledWith('TEST-1', 1, {
      content: 'Updated comment content',
    });
  });

  it('calls backlog.patchIssueComment with correct params when using issueId', async () => {
    await tool.handler({
      issueId: 100,
      commentId: 2,
      content: 'Updated via issueId',
    });

    expect(mockBacklog.patchIssueComment).toHaveBeenCalledWith(100, 2, {
      content: 'Updated via issueId',
    });
  });

  it('throws an error if neither issueId nor issueKey is provided', async () => {
    await expect(
      tool.handler({
        commentId: 1,
        content: 'This should fail due to missing issue identifier',
      } as any)
    ).rejects.toThrow(Error);
  });
});
