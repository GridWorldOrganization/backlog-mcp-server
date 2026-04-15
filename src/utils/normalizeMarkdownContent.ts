/**
 * Recover from over-escaped markdown bodies.
 *
 * Some MCP clients (notably LLMs constructing JSON by hand) emit literal `\n`
 * sequences in `content` strings instead of real LF characters. Backlog renders
 * the body verbatim, so the literal backslash-n leaks into the page and breaks
 * tables and code blocks.
 *
 * Heuristic: only normalize when the body has literal `\n` patterns AND no real
 * line breaks. That way, legitimate code samples that contain `\n` inside a
 * fenced block (and also have real newlines around them) are left untouched.
 */
export function normalizeMarkdownContent<T extends string | undefined>(
  content: T
): T {
  if (typeof content !== 'string') return content;
  if (content.includes('\n') || content.includes('\r')) return content;
  if (!/\\[nrt]/.test(content)) return content;
  return content
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\t/g, '\t') as T;
}
