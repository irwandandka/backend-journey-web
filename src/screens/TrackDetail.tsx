import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { Trail } from '../components/Trail'
import { ApiError } from '../lib/api'
import { useApp } from '../lib/app-state'
import { learning } from '../lib/learning'
import type { Journey, Tier, TrackDetail as TrackModel } from '../lib/types'

const TIERS: Tier[] = ['foundation', 'intermediate', 'advanced', 'deep']

export function TrackDetail() {
  const { slug = '' } = useParams()
  const { locale, isLight, t } = useApp()
  const navigate = useNavigate()
  const { state } = useLocation()
  const toast = useToast()
  const [track, setTrack] = useState<TrackModel | null>(null)
  const [failed, setFailed] = useState(false)
  const [starting, setStarting] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    setFailed(false)

    learning
      .track(slug, locale)
      .then((data) => live && setTrack(data))
      .catch(() => live && setFailed(true))

    return () => {
      live = false
    }
  }, [slug, locale])

  const focus = typeof state === 'object' && state !== null && 'focus' in state ? String(state.focus) : null

  useEffect(() => {
    if (track === null || focus === null) return

    const node = document.querySelector(`[data-journey="${CSS.escape(focus)}"]`)

    node?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    ;(node as HTMLElement | null)?.focus({ preventScroll: true })
  }, [track, focus])

  const hue = track === null ? 'var(--grad-1)' : isLight ? track.colorLight : track.colorDark

  const tierLabel: Record<Tier, string> = {
    foundation: t.tierFoundation,
    intermediate: t.tierIntermediate,
    advanced: t.tierAdvanced,
    deep: t.tierDeep,
  }

  async function open(journey: Journey) {
    if (journey.status === 'locked') {
      toast.show(t.lockedToast)
      return
    }

    if (journey.quizSlug === null) {
      toast.show(t.noQuiz)
      return
    }

    setStarting(journey.slug)

    try {
      const attempt = await learning.startQuiz(journey.quizSlug, locale)

      navigate(`/session/${attempt.id}`, {
        state: { hue, title: journey.title, backTo: `/tracks/${slug}` },
      })
    } catch (cause) {
      toast.show(cause instanceof ApiError ? (cause.firstError('journey') ?? cause.message) : t.unreachable)
    } finally {
      setStarting(null)
    }
  }

  if (failed) return <p className="error">{t.unreachable}</p>
  if (track === null) return <p className="sub">{t.loading}</p>

  const completed = track.journeys.filter((journey) => journey.status === 'completed').length

  return (
    <div style={{ ['--hue' as string]: hue }}>
      <button type="button" className="btn ghost sm" style={{ marginBottom: 18 }} onClick={() => navigate('/roadmap')}>
        ← {t.backTracks}
      </button>

      <p className="eyebrow">
        {completed}/{track.journeys.length} {t.journeys}
      </p>
      <h1 style={{ fontSize: 'clamp(24px, 5.4vw, 34px)' }}><em>{track.name}</em></h1>
      {track.description !== null && <p className="sub">{track.description}</p>}

      {TIERS.map((tier) => {
        const journeys = track.journeys.filter((journey) => journey.tier === tier)

        if (journeys.length === 0) return null

        return (
          <section className="tier" key={tier}>
            <div className="hd">
              <em>{tierLabel[tier]}</em>
              <hr />
              <span>{journeys.length} {t.journeys}</span>
            </div>

            <Trail
              journeys={journeys}
              starting={starting}
              labels={{ locked: t.statusLocked, done: t.statusDone, questions: t.questions }}
              focus={focus}
              onOpen={(journey) => void open(journey)}
            />
          </section>
        )
      })}

      {toast.node}
    </div>
  )
}
