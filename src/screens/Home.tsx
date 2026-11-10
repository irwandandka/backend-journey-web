import { useNavigate } from 'react-router-dom'
import { useApp } from '../lib/app-state'
import type { ReviewSummary } from '../lib/types'

type Props = {
  summary: ReviewSummary | null
  starting: boolean
  onStartReview: () => void
}

export function Home({ summary, starting, onStartReview }: Props) {
  const { user, t, locale } = useApp()
  const navigate = useNavigate()

  const due = summary?.dueCount ?? 0
  const tracked = summary?.trackedCount ?? 0

  const nextDue =
    summary?.nextDueAt === null || summary?.nextDueAt === undefined
      ? null
      : new Date(summary.nextDueAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB', {
          day: 'numeric',
          month: 'short',
        })

  return (
    <>
      <p className="eyebrow">{t.greeting}</p>
      <h1>{due > 0 ? t.homeDue(due) : t.homeNothingDue}</h1>
      <p className="sub">{t.homeLead}</p>

      <div className="stats">
        <div className="tile"><span className="k">{t.statXp}</span><span className="v">{user?.xpTotal ?? 0}</span></div>
        <div className="tile"><span className="k">{t.statStreak}</span><span className="v">{user?.currentStreak ?? 0}<span className="u"> {t.days}</span></span></div>
        <div className="tile"><span className="k">{t.statTracked}</span><span className="v">{tracked}</span></div>
        <div className="tile"><span className="k">{t.statDue}</span><span className="v">{due}</span></div>
      </div>

      {due > 0 ? (
        <div className="card hot">
          <div className="row">
            <div className="orbn hot">{due}</div>
            <div className="txt">
              <strong>{t.reviewTitle(due)}</strong>
              <span>{t.homeLead}</span>
            </div>
            <button type="button" className="btn ghost sm" onClick={onStartReview} disabled={starting}>
              {starting ? t.loading : t.reviewStart}
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="row">
            <div className="orbn ok">✓</div>
            <div className="txt">
              <strong>{t.reviewEmptyTitle}</strong>
              <span>{tracked === 0 ? t.reviewNoneTracked : nextDue === null ? '' : t.reviewNextAt(nextDue)}</span>
            </div>
            <button type="button" className="btn ghost sm" onClick={() => navigate('/roadmap')}>
              {t.openRoadmap}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
