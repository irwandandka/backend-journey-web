import type { HighlighterCore } from 'shiki/core'

export const LANGUAGES = ['sql', 'php', 'typescript', 'javascript', 'bash', 'json', 'go', 'python'] as const

export type Language = (typeof LANGUAGES)[number]

const ALIASES: Record<string, Language> = {
  sql: 'sql',
  postgres: 'sql',
  postgresql: 'sql',
  psql: 'sql',
  php: 'php',
  ts: 'typescript',
  typescript: 'typescript',
  js: 'javascript',
  javascript: 'javascript',
  node: 'javascript',
  sh: 'bash',
  bash: 'bash',
  shell: 'bash',
  zsh: 'bash',
  json: 'json',
  go: 'go',
  golang: 'go',
  py: 'python',
  python: 'python',
}

export function resolveLanguage(raw: string | null | undefined): Language | null {
  if (raw === null || raw === undefined) return null

  return ALIASES[raw.trim().toLowerCase()] ?? null
}

const GRAMMARS: Record<Language, () => Promise<unknown>> = {
  sql: () => import('shiki/langs/sql.mjs'),
  php: () => import('shiki/langs/php.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  go: () => import('shiki/langs/go.mjs'),
  python: () => import('shiki/langs/python.mjs'),
}

let core: Promise<HighlighterCore> | null = null
const loaded = new Map<Language, Promise<void>>()

/**
 * Both themes are compiled in so switching theme never re-highlights, but the
 * grammars are not: each one is fetched the first time a snippet needs it. A
 * SQL question therefore never downloads the PHP grammar, which is ten times
 * the size. The JavaScript regex engine is used rather than Oniguruma, which
 * drops a 600 kB WebAssembly payload; all eight grammars were checked against
 * it before the swap.
 */
function highlighterCore(): Promise<HighlighterCore> {
  core ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine/javascript'),
    ])

    return createHighlighterCore({
      themes: [import('shiki/themes/tokyo-night.mjs'), import('shiki/themes/github-light.mjs')],
      langs: [],
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    })
  })()

  return core
}

export async function highlight(code: string, language: Language): Promise<string> {
  const shiki = await highlighterCore()

  let pending = loaded.get(language)

  if (pending === undefined) {
    pending = GRAMMARS[language]().then(async (grammar) => {
      await shiki.loadLanguage(grammar as never)
    })

    loaded.set(language, pending)
  }

  await pending

  return shiki.codeToHtml(code, {
    lang: language,
    themes: { dark: 'tokyo-night', light: 'github-light' },
    defaultColor: false,
    cssVariablePrefix: '--bj-',
  })
}
