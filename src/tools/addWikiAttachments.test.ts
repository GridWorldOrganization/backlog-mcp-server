import { addWikiAttachmentsTool } from './addWikiAttachments.js';
import { vi, describe, it, expect } from 'vitest';
import type { Backlog } from 'backlog-js';
import { createTranslationHelper } from '../createTranslationHelper.js';

describe('addWikiAttachmentsTool', () => {
  const mockBacklog: Partial<Backlog> = {
    postWikisAttachments: vi.fn<() => Promise<any>>().mockResolvedValue([{ id: 7 }]),
  };
  const tool = addWikiAttachmentsTool(mockBacklog as Backlog, createTranslationHelper());

  it('links attachments', async () => {
    const result = await tool.handler({ wikiId: 42, attachmentId: [7, 8] });
    expect(Array.isArray(result)).toBe(true);
    expect(mockBacklog.postWikisAttachments).toHaveBeenCalledWith(42, [7, 8]);
  });
});
