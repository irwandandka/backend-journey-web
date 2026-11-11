import { useEffect, useRef, useState } from 'react'
import { CheckIcon, LockIcon, PlayIcon } from './Icons'
import type { Journey } from '../lib/types'

const STEP = 112
const MAX_AMPLITUDE = 96

type Props = {
  journeys: Journey[]
  starting: string | null
  labels: { locked: string; done: string; questions: string }
  focus?: string | null
  onOpen: (journey: Journey) => void
}

/**
 * The trail is laid out in pixels rather than percentages so the SVG connector
 * and the nodes cannot drift apart at any width. The container is measured
 * instead of guessed, which also makes the amplitude shrink on a phone.
 */
export function Trail({ journeys, starting, labels, focus = null, onOpen }: Props) {
  const host = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const node = host.current

    if (node === null) return

    setWidth(node.clientWidth)

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width)
    })

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const amplitude = Math.min(MAX_AMPLITUDE, width * 0.24)
  const height = journeys.length * STEP
  const offset = (index: number) => Math.round(Math.sin((index * Math.PI) / 2) * amplitude)
  const point = (index: number) => ({ x: width / 2 + offset(index), y: index * STEP + STEP / 2 })

  const segments = journeys.slice(0, -1).map((journey, index) => {
    const from = point(index)
    const to = point(index + 1)
    const midY = (from.y + to.y) / 2

    return {
      key: journey.slug,
      done: journey.status === 'completed',
      d: `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`,
    }
  })

  return (
    <div className="trail" ref={host} style={{ height }}>
      {width > 0 && (
        <svg className="trailpath" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          {segments.map((segment) => (
            <path key={segment.key} d={segment.d} className={segment.done ? 'done' : undefined} />
          ))}
        </svg>
      )}

      {journeys.map((journey, index) => {
        const { x, y } = point(index)

        return (
          <button
            key={journey.slug}
            type="button"
            className={`node ${journey.status}${journey.slug === focus ? ' focused' : ''}`}
            data-journey={journey.slug}
            style={{ top: y, left: x }}
            disabled={journey.status === 'locked' || starting === journey.slug}
            onClick={() => onOpen(journey)}
            aria-label={journey.title}
          >
            <span className="orb">
              {journey.status === 'completed' ? (
                <CheckIcon />
              ) : journey.status === 'locked' ? (
                <LockIcon />
              ) : (
                <PlayIcon />
              )}
              {journey.bestScore !== null && <em>{journey.bestScore}%</em>}
            </span>
            <span className="label">
              <strong>{journey.title}</strong>
              <span>
                {journey.status === 'locked'
                  ? labels.locked
                  : journey.status === 'completed'
                    ? `${journey.attemptsCount}× · ${labels.done}`
                    : `${journey.questionCount} ${labels.questions}`}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
