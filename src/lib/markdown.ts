const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char])
}

/**
 * Renders the small slice of Markdown the question bank actually uses:
 * inline code, bold and italic. Everything is escaped first, so the
 * output is safe to inject even though the source is author-written.
 */
export function renderInline(source: string | null | undefined): string {
  if (source === null || source === undefined || source === '') return ''

  return escapeHtml(source)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>')
}
