import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useToast } from './components/Toast'
import { ApiError } from './lib/api'
import { useApp } from './lib/app-state'
import { learning } from './lib/learning'
import { Home } from './screens/Home'
import { Login } from './screens/Login'
import { Roadmap } from './screens/Roadmap'
import { Session } from './screens/Session'
import { TrackDetail } from './screens/TrackDetail'
import type { ReviewSummary } from './lib/types'

export default function App() {
  const { user, booting, locale, t } = useApp()
  const [summary, setSummary] = useState<ReviewSummary | null>(null)

  const refreshSummary = useCallback(() => {
    if (user === null) return

    learning
      .reviewSummary(locale)
      .then(setSummary)
      .catch(() => setSummary(null))
  }, [user, locale])

  useEffect(refreshSummary, [refreshSummary])

  if (booting) {
    return (
      <div className="shell">
        <p className="sub">{t.loading}</p>
      </div>
    )
  }

  if (user === null) return <Login />

  return (
    <Routes>
      <Route element={<AppShell dueCount={summary?.dueCount ?? 0} />}>
        <Route index element={<ReviewLauncher summary={summary} onChanged={refreshSummary} />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="tracks/:slug" element={<TrackDetail />} />
        <Route path="review" element={<ReviewLauncher summary={summary} onChanged={refreshSummary} autoStart />} />
        <Route path="session/:attemptId" element={<Session />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function ReviewLauncher({
  summary,
  onChanged,
  autoStart = false,
}: {
  summary: ReviewSummary | null
  onChanged: () => void
  autoStart?: boolean
}) {
  const { locale, t } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [starting, setStarting] = useState(false)

  const start = useCallback(async () => {
    setStarting(true)

    try {
      const attempt = await learning.startReview(locale)

      navigate(`/session/${attempt.id}`, {
        state: { hue: 'var(--grad-2)', title: t.reviewSession, backTo: '/' },
      })
    } catch (cause) {
      toast.show(cause instanceof ApiError ? (cause.firstError('review') ?? cause.message) : t.unreachable)
      onChanged()
    } finally {
      setStarting(false)
    }
  }, [locale, navigate, onChanged, t.reviewSession, t.unreachable, toast])

  useEffect(() => {
    if (autoStart && summary !== null && summary.dueCount > 0) void start()
  }, [autoStart, summary, start])

  return (
    <>
      <Home summary={summary} starting={starting} onStartReview={() => void start()} />
      {toast.node}
    </>
  )
}
