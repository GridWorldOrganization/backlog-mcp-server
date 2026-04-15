import { deleteWikiTool } from './deleteWiki.js';
import { vi, describe, it, expect } from 'vitest';
import type { Backlog } from 'backlog-js';
import { createTranslationHelper } from '../createTranslationHelper.js';

describe('deleteWikiTool', () => {
  const mockBacklog: Partial<Backlog> = {
    deleteWiki: vi.fn<() => Promise<any>>().mockResolvedValue({ id: 42, name: 'Old Page' }),
  };
  const tool = deleteWikiTool(mockBacklog as Backlog, createTranslationHelper());

  it('deletes wiki and returns the deleted entity', async () => {
    const result = await tool.handler({ wikiId: 42 });
    if (Array.isArray(result)) throw new Error('unexpected array');
    expect(result.id).toBe(42);
    expect(mockBacklog.deleteWiki).toHaveBeenCalledWith(42, false);
  });

  it('passes mailNotify when provided', async () => {
    await tool.handler({ wikiId: 42, mailNotify: true });
    expect(mockBacklog.deleteWiki).toHaveBeenLastCalledWith(42, true);
  });

  it('accepts string wikiId', async () => {
    await tool.handler({ wikiId: '42' });
    expect(mockBacklog.deleteWiki).toHaveBeenLastCalledWith(42, false);
  });
});
