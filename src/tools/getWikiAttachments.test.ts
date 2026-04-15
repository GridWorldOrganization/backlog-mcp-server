import { getWikiAttachmentsTool } from './getWikiAttachments.js';
import { vi, describe, it, expect } from 'vitest';
import type { Backlog } from 'backlog-js';
import { createTranslationHelper } from '../createTranslationHelper.js';

describe('getWikiAttachmentsTool', () => {
  const mockBacklog: Partial<Backlog> = {
    getWikisAttachments: vi.fn<() => Promise<any>>().mockResolvedValue([{ id: 1, name: 'a.png' }]),
  };
  const tool = getWikiAttachmentsTool(mockBacklog as Backlog, createTranslationHelper());

  it('returns attachments', async () => {
    const result = await tool.handler({ wikiId: 42 });
    expect(Array.isArray(result)).toBe(true);
    expect(mockBacklog.getWikisAttachments).toHaveBeenCalledWith(42);
  });

  it('accepts string wikiId', async () => {
    await tool.handler({ wikiId: '42' });
    expect(mockBacklog.getWikisAttachments).toHaveBeenLastCalledWith(42);
  });
});
