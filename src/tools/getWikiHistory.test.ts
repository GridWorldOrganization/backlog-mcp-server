import { getWikiHistoryTool } from './getWikiHistory.js';
import { vi, describe, it, expect } from 'vitest';
import type { Backlog } from 'backlog-js';
import { createTranslationHelper } from '../createTranslationHelper.js';

describe('getWikiHistoryTool', () => {
  const mockBacklog: Partial<Backlog> = {
    getWikisHistory: vi.fn<() => Promise<any>>().mockResolvedValue([
      { pageId: 42, version: 2, name: 'Page', content: 'v2', createdUser: {}, created: '2026-01-01' },
    ]),
  };
  const tool = getWikiHistoryTool(mockBacklog as Backlog, createTranslationHelper());

  it('returns history list', async () => {
    const result = await tool.handler({ wikiId: 42, count: 10 });
    expect(Array.isArray(result)).toBe(true);
    expect(mockBacklog.getWikisHistory).toHaveBeenCalledWith(42, { count: 10 });
  });

  it('passes order param', async () => {
    await tool.handler({ wikiId: 42, order: 'asc' });
    expect(mockBacklog.getWikisHistory).toHaveBeenLastCalledWith(42, { order: 'asc' });
  });

  it('accepts string wikiId', async () => {
    await tool.handler({ wikiId: '42' });
    expect(mockBacklog.getWikisHistory).toHaveBeenLastCalledWith(42, {});
  });
});
