import { getWikiTagsTool } from './getWikiTags.js';
import { vi, describe, it, expect } from 'vitest';
import type { Backlog } from 'backlog-js';
import { createTranslationHelper } from '../createTranslationHelper.js';

describe('getWikiTagsTool', () => {
  const mockBacklog: Partial<Backlog> = {
    getWikisTags: vi
      .fn<() => Promise<any>>()
      .mockResolvedValue([{ id: 1, name: 'docs' }]),
  };
  const tool = getWikiTagsTool(
    mockBacklog as Backlog,
    createTranslationHelper()
  );

  it('resolves projectId', async () => {
    const result = await tool.handler({ projectId: 100 });
    expect(Array.isArray(result)).toBe(true);
    expect(mockBacklog.getWikisTags).toHaveBeenCalledWith(100);
  });

  it('resolves projectKey', async () => {
    await tool.handler({ projectKey: 'PROJ' });
    expect(mockBacklog.getWikisTags).toHaveBeenLastCalledWith('PROJ');
  });

  it('throws when neither given', async () => {
    await expect(tool.handler({})).rejects.toThrow();
  });
});
