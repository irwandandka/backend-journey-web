const GLYPHS: Record<string, string> = {
  flag: '⚑',
  flame: '▲',
  check: '✓',
  star: '★',
  bolt: '⚡',
  clock: '◷',
}

export function glyphFor(icon: string): string {
  return GLYPHS[icon] ?? '★'
}
