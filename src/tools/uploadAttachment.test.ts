import { uploadAttachmentTool } from './uploadAttachment.js';
import { vi, describe, it, expect } from 'vitest';
import type { Backlog } from 'backlog-js';
import { writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTranslationHelper } from '../createTranslationHelper.js';

describe('uploadAttachmentTool', () => {
  const mockBacklog: Partial<Backlog> = {
    postSpaceAttachment: vi
      .fn<() => Promise<any>>()
      .mockResolvedValue({ id: 999, name: 'test.txt', size: 5 }),
  };
  const tool = uploadAttachmentTool(
    mockBacklog as Backlog,
    createTranslationHelper()
  );

  it('uploads a file and returns FileInfo', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wiki-upload-'));
    const path = join(dir, 'test.txt');
    await writeFile(path, 'hello');

    const result = await tool.handler({ filePath: path });
    if (Array.isArray(result)) throw new Error('unexpected array');
    expect(result.id).toBe(999);
    expect(mockBacklog.postSpaceAttachment).toHaveBeenCalledTimes(1);
    const formArg = (mockBacklog.postSpaceAttachment as any).mock.calls[0][0];
    expect(formArg).toBeInstanceOf(FormData);
    expect(formArg.get('file')).toBeTruthy();
  });

  it('honors fileName override', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wiki-upload-'));
    const path = join(dir, 'orig.txt');
    await writeFile(path, 'x');

    await tool.handler({ filePath: path, fileName: 'renamed.txt' });
    const form = (mockBacklog.postSpaceAttachment as any).mock.calls.at(-1)[0];
    const file = form.get('file') as File;
    expect(file.name).toBe('renamed.txt');
  });
});
