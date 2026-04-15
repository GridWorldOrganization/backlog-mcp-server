import { deleteWikiAttachmentTool } from './deleteWikiAttachment.js';
import { vi, describe, it, expect } from 'vitest';
import type { Backlog } from 'backlog-js';
import { createTranslationHelper } from '../createTranslationHelper.js';

describe('deleteWikiAttachmentTool', () => {
  const mockBacklog: Partial<Backlog> = {
    deleteWikisAttachments: vi
      .fn<() => Promise<any>>()
      .mockResolvedValue({ id: 7, name: 'a.png' }),
  };
  const tool = deleteWikiAttachmentTool(
    mockBacklog as Backlog,
    createTranslationHelper()
  );

  it('removes attachment', async () => {
    const result = await tool.handler({ wikiId: 42, attachmentId: 7 });
    if (Array.isArray(result)) throw new Error('unexpected array');
    expect(result.id).toBe(7);
    expect(mockBacklog.deleteWikisAttachments).toHaveBeenCalledWith(42, 7);
  });

  it('accepts string wikiId', async () => {
    await tool.handler({ wikiId: '42', attachmentId: 7 });
    expect(mockBacklog.deleteWikisAttachments).toHaveBeenLastCalledWith(42, 7);
  });
});
