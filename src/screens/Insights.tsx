import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Markdown } from '../components/Markdown'
import { useApp } from '../lib/app-state'
import { learning } from '../lib/learning'
import type { Insight } from '../lib/types'

type Row = Insight['byTag'][number]

function toneFor(accuracy: number): string {
  if (accuracy >= 80) return 'var(--ok)'
  if (accuracy >= 55) return 'var(--flame)'

  return 'var(--bad)'
}

function Bars({ rows, title }: { rows: Row[]; title: string }) {
  const { t } = useApp()

  if (rows.length === 0) return null

  return (
    <section className="tier">
      <div className="hd">
        <em>{title}</em>
        <hr />
        <span>{rows.length}</span>
      </div>

      <div className="rows">
        {rows.map((row) => (
          <div key={row.slug} className="bar-row">
            <div className="top">
              <strong>{row.name}</strong>
              <span className="grow" />
              <em style={{ color: toneFor(row.accuracy) }}>{row.accuracy}%</em>
              <span className="n">{t.insightsOf(row.correct, row.answered)}</span>
            </div>
            <div className="meter">
              <i style={{ width: `${row.accuracy}%`, background: toneFor(row.accuracy) }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Insights() {
  const { locale, t } = useApp()
  const navigate = useNavigate()
  const [data, setData] = useState<Insight | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let live = true
    setFailed(false)

    learning
      .insights(locale)
      .then((rows) => live && setData(rows))
      .catch(() => live && setFailed(true))

    return () => {
      live = false
    }
  }, [locale])

  if (failed) return <p className="error">{t.unreachable}</p>
  if (data === null) return <p className="sub">{t.loading}</p>

  const { overall } = data

  return (
    <>
      <p className="eyebrow">{t.navInsights}</p>
      <h1 style={{ fontSize: 'clamp(24px, 5.4vw, 34px)' }}>{t.insightsTitle}</h1>
      <p className="sub">{t.insightsLead}</p>

      {overall.answered === 0 ? (
        <div className="card">
          <div className="row">
            <div className="orbn ok">◷</div>
            <div className="txt">
              <strong>{t.insightsEmpty}</strong>
            </div>
            <button type="button" className="btn ghost sm" onClick={() => navigate('/roadmap')}>
              {t.openRoadmap}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="stats">
            <div className="tile">
              <span className="k">{t.insightsAnswered}</span>
              <span className="v">{overall.answered}</span>
            </div>
            <div className="tile">
              <span className="k">{t.insightsAccuracy}</span>
              <span className="v" style={{ color: toneFor(overall.accuracy ?? 0) }}>
                {overall.accuracy ?? 0}
                <span className="u">%</span>
              </span>
            </div>
            <div className="tile">
              <span className="k">{t.insightsCorrect}</span>
              <span className="v">{overall.correct}</span>
            </div>
            <div className="tile">
              <span className="k">{t.insightsTracked}</span>
              <span className="v">{overall.tracked}</span>
            </div>
          </div>

          <Bars rows={data.byTag} title={t.insightsByTag} />
          <Bars rows={data.byTrack} title={t.insightsByTrack} />

          {data.hardestQuestions.length > 0 && (
            <section className="tier">
              <div className="hd">
                <em>{t.insightsHardest}</em>
                <hr />
              </div>
              <div className="rows">
                {data.hardestQuestions.map((question) => (
                  <button
                    key={question.key}
                    type="button"
                    className="hard-row"
                    onClick={() => navigate(`/tracks/${question.trackSlug}`)}
                  >
                    <span className="count">{question.lapses}×</span>
                    <span className="body">
                      <Markdown as="span" source={question.stem.slice(0, 120)} />
                      <span className="meta">
                        {question.trackSlug} ·{' '}
                        {t.insightsDue(
                          new Date(question.dueAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB', {
                            day: 'numeric',
                            month: 'short',
                          }),
                        )}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
