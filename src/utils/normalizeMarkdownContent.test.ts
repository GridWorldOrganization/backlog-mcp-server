import { describe, it, expect } from 'vitest';
import { normalizeMarkdownContent } from './normalizeMarkdownContent.js';

describe('normalizeMarkdownContent', () => {
  it('converts literal \\n to real newlines when no real newlines exist', () => {
    const input = '# Title\\n\\n| a | b |\\n|---|---|';
    expect(normalizeMarkdownContent(input)).toBe('# Title\n\n| a | b |\n|---|---|');
  });

  it('leaves content alone when real newlines already exist', () => {
    const input = 'line1\nline2 with literal \\n in code';
    expect(normalizeMarkdownContent(input)).toBe(input);
  });

  it('leaves content with no escape sequences alone', () => {
    expect(normalizeMarkdownContent('plain single line')).toBe('plain single line');
  });

  it('handles \\r\\n and \\t', () => {
    expect(normalizeMarkdownContent('a\\r\\nb\\tc')).toBe('a\nb\tc');
  });

  it('passes through undefined unchanged', () => {
    expect(normalizeMarkdownContent(undefined)).toBeUndefined();
  });
});
