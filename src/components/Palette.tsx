import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../lib/app-state'
import { learning } from '../lib/learning'
import type { JourneySearch, Locale } from '../lib/types'

const LIMIT = 8

function score(journey: JourneySearch, needle: string): number {
  const title = journey.title.toLowerCase()
  const track = journey.trackName.toLowerCase()
  const slug = journey.slug.toLowerCase()

  if (title.startsWith(needle)) return 0
  if (title.includes(needle)) return 1
  if (slug.includes(needle)) return 2
  if (track.includes(needle)) return 3

  return Number.POSITIVE_INFINITY
}

export function Palette() {
  const { locale, t } = useApp()
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [journeys, setJourneys] = useState<JourneySearch[] | null>(null)
  const [loadedLocale, setLoadedLocale] = useState<Locale | null>(null)
  const [term, setTerm] = useState('')
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)

        return
      }

      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Fetched the first time the palette opens, and again after a locale change,
  // so the titles always match what the rest of the app is showing.
  useEffect(() => {
    if (!open) return

    setCursor(0)
    input.current?.focus()

    if (loadedLocale === locale) return

    learning
      .journeys(locale)
      .then((rows) => {
        setJourneys(rows)
        setLoadedLocale(locale)
      })
      .catch(() => setJourneys([]))
  }, [open, locale, loadedLocale])

  const results = useMemo(() => {
    if (journeys === null) return []

    const needle = term.trim().toLowerCase()

    if (needle === '') return journeys.slice(0, LIMIT)

    return journeys
      .map((journey) => ({ journey, rank: score(journey, needle) }))
      .filter((row) => Number.isFinite(row.rank))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, LIMIT)
      .map((row) => row.journey)
  }, [journeys, term])

  const go = useCallback(
    (journey: JourneySearch) => {
      setOpen(false)
      setTerm('')
      navigate(`/tracks/${journey.trackSlug}`, { state: { focus: journey.slug } })
    },
    [navigate],
  )

  if (!open) {
    return (
      <button type="button" className="icon-btn" onClick={() => setOpen(true)} title={t.searchOpen} aria-label={t.searchOpen}>
        ⌕
      </button>
    )
  }

  return (
    <>
      <button type="button" className="icon-btn" onClick={() => setOpen(false)} title={t.searchOpen} aria-label={t.searchOpen}>
        ⌕
      </button>

      <div className="palette-back" role="presentation" onClick={() => setOpen(false)}>
        <div className="palette" role="dialog" aria-modal="true" aria-label={t.searchOpen} onClick={(e) => e.stopPropagation()}>
          <input
            ref={input}
            value={term}
            placeholder={t.searchPlaceholder}
            onChange={(event) => {
              setTerm(event.target.value)
              setCursor(0)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setCursor((c) => Math.min(c + 1, Math.max(results.length - 1, 0)))
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault()
                setCursor((c) => Math.max(c - 1, 0))
              }

              if (event.key === 'Enter' && results[cursor] !== undefined) go(results[cursor])
            }}
          />

          {journeys === null ? (
            <p className="palette-empty">{t.loading}</p>
          ) : results.length === 0 ? (
            <p className="palette-empty">{t.searchNothing}</p>
          ) : (
            <ul>
              {results.map((journey, index) => (
                <li key={journey.slug}>
                  <button
                    type="button"
                    className={index === cursor ? 'on' : undefined}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => go(journey)}
                  >
                    <span className="txt">
                      <strong>{journey.title}</strong>
                      <span>{journey.trackName}</span>
                    </span>
                    <span className="pill">{journey.tier}</span>
                    {!journey.hasQuiz && <span className="pill none">{t.noQuizShort}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="palette-hint">{t.searchHint}</p>
        </div>
      </div>
    </>
  )
}
