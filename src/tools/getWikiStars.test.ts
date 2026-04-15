import { getWikiStarsTool } from './getWikiStars.js';
import { vi, describe, it, expect } from 'vitest';
import type { Backlog } from 'backlog-js';
import { createTranslationHelper } from '../createTranslationHelper.js';

describe('getWikiStarsTool', () => {
  const mockBacklog: Partial<Backlog> = {
    getWikisStars: vi.fn<() => Promise<any>>().mockResolvedValue([{ id: 1 }]),
  };
  const tool = getWikiStarsTool(
    mockBacklog as Backlog,
    createTranslationHelper()
  );

  it('returns stars', async () => {
    const result = await tool.handler({ wikiId: 42 });
    expect(Array.isArray(result)).toBe(true);
    expect(mockBacklog.getWikisStars).toHaveBeenCalledWith(42);
  });

  it('accepts string wikiId', async () => {
    await tool.handler({ wikiId: '42' });
    expect(mockBacklog.getWikisStars).toHaveBeenLastCalledWith(42);
  });
});
