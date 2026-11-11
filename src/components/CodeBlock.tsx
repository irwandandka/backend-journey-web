import { useEffect, useState } from 'react'
import { highlight, resolveLanguage } from '../lib/highlight'

type Props = { code: string; language: string | null }

export function CodeBlock({ code, language }: Props) {
  const resolved = resolveLanguage(language)
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    if (resolved === null) {
      setHtml(null)

      return
    }

    let live = true

    highlight(code, resolved)
      .then((markup) => {
        if (live) setHtml(markup)
      })
      .catch(() => {
        if (live) setHtml(null)
      })

    return () => {
      live = false
    }
  }, [code, resolved])

  // Until the grammar has loaded, and for a language Shiki is not carrying,
  // the plain text renders in the same box rather than nothing at all.
  if (html === null) {
    return (
      <pre className="code">
        <code>{code}</code>
      </pre>
    )
  }

  return <div className="code shiki-host" dangerouslySetInnerHTML={{ __html: html }} />
}
