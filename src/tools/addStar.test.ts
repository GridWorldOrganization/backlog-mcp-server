import { addStarTool } from './addStar.js';
import { vi, describe, it, expect } from 'vitest';
import type { Backlog } from 'backlog-js';
import { createTranslationHelper } from '../createTranslationHelper.js';

describe('addStarTool', () => {
  const mockBacklog: Partial<Backlog> = {
    postStar: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = addStarTool(mockBacklog as Backlog, mockTranslationHelper);

  it('adds a star to an issue', async () => {
    const result = await tool.handler({ issueId: 42 });
    if (Array.isArray(result)) throw new Error('Unexpected array result');
    expect(result.success).toBe(true);
    expect(mockBacklog.postStar).toHaveBeenCalledWith({ issueId: 42 });
  });

  it('throws when no target is provided', async () => {
    await expect(tool.handler({})).rejects.toThrow(/Exactly one/);
  });

  it('throws when multiple targets are provided', async () => {
    await expect(tool.handler({ issueId: 1, wikiId: 2 })).rejects.toThrow(
      /Exactly one/
    );
  });
});
