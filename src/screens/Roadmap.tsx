import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../lib/app-state'
import { learning } from '../lib/learning'
import type { Roadmap as RoadmapModel } from '../lib/types'

export function Roadmap() {
  const { locale, isLight, t } = useApp()
  const navigate = useNavigate()
  const [roadmap, setRoadmap] = useState<RoadmapModel | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let live = true
    setFailed(false)

    learning
      .roadmap(locale)
      .then((data) => live && setRoadmap(data))
      .catch(() => live && setFailed(true))

    return () => {
      live = false
    }
  }, [locale])

  if (failed) return <p className="error">{t.unreachable}</p>
  if (roadmap === null) return <p className="sub">{t.loading}</p>

  return (
    <>
      <p className="eyebrow">{t.allTracks}</p>
      <h1><em>{roadmap.title}</em></h1>
      {roadmap.description !== null && <p className="sub">{roadmap.description}</p>}

      <h2>
        {t.allTracks} <span className="count">{t.trackCount(roadmap.tracks.length)}</span>
      </h2>

      <div className="tgrid">
        {roadmap.tracks.map((track) => (
          <button
            key={track.slug}
            type="button"
            className="tcard"
            style={{ ['--hue' as string]: isLight ? track.colorLight : track.colorDark }}
            onClick={() => navigate(`/tracks/${track.slug}`)}
          >
            <span className="top">
              <span className="ico">{track.abbreviation}</span>
              <span className="nm">{track.name}</span>
            </span>
            <span className="meta">
              {track.completedCount}/{track.journeyCount} {t.journeys}
              {track.dueCount > 0 && <span className="badge-due">{track.dueCount} {t.due}</span>}
            </span>
            <span className="pbar">
              <i style={{ width: `${Math.max(2, Math.round((track.completedCount / Math.max(1, track.journeyCount)) * 100))}%` }} />
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
