import confetti from 'canvas-confetti'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Markdown } from '../components/Markdown'
import { ApiError } from '../lib/api'
import { auth } from '../lib/auth'
import { useApp } from '../lib/app-state'
import { learning } from '../lib/learning'
import type { AnswerResult, AttemptResult, ServedQuestion } from '../lib/types'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

type SessionState = { hue?: string; title?: string; backTo?: string }

export function Session() {
  const { attemptId = '0' } = useParams()
  const id = Number(attemptId)
  const location = useLocation()
  const navigate = useNavigate()
  const { locale, t, setUser } = useApp()

  const state = (location.state ?? {}) as SessionState
  const hue = state.hue ?? 'var(--grad-2)'
  const title = state.title ?? t.reviewSession
  const backTo = state.backTo ?? '/'

  const [questions, setQuestions] = useState<ServedQuestion[] | null>(null)
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [outcome, setOutcome] = useState<AttemptResult | null>(null)
  const [verdicts, setVerdicts] = useState<Record<number, boolean>>({})
  const [picked, setPicked] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const shownAt = useRef<number>(Date.now())

  useEffect(() => {
    let live = true

    learning
      .questions(id, locale)
      .then((served) => {
        if (!live) return

        setQuestions(served)
        const firstOpen = served.findIndex((question) => !question.answered)
        setIndex(firstOpen === -1 ? Math.max(0, served.length - 1) : firstOpen)
        shownAt.current = Date.now()
      })
      .catch(() => live && setFailed(t.unreachable))

    return () => {
      live = false
    }
  }, [id, locale, t.unreachable])

  const current = questions === null ? null : (questions[index] ?? null)
  const isLast = questions !== null && index >= questions.length - 1

  const submit = useCallback(async () => {
    setBusy(true)

    try {
      const final = await learning.submit(id, locale)
      setOutcome(final)
      auth.me().then(setUser).catch(() => undefined)

      if (final.passed) {
        confetti({
          particleCount: 120,
          spread: 98,
          startVelocity: 44,
          origin: { y: 0.32 },
          disableForReducedMotion: true,
        })
      }
    } catch (cause) {
      setFailed(cause instanceof ApiError ? cause.message : t.unreachable)
    } finally {
      setBusy(false)
    }
  }, [id, locale, setUser, t.unreachable])

  async function choose(optionId: number, element: HTMLButtonElement) {
    if (current === null || busy || result !== null) return

    setBusy(true)
    setPicked(optionId)

    try {
      const answered = await learning.answer(
        id,
        current.position,
        [optionId],
        Date.now() - shownAt.current,
        locale,
      )

      setResult(answered)
      setVerdicts((previous) => ({ ...previous, [current.position]: answered.isCorrect }))

      if (answered.isCorrect) {
        const box = element.getBoundingClientRect()

        confetti({
          particleCount: 66,
          spread: 68,
          startVelocity: 36,
          decay: 0.9,
          scalar: 0.86,
          origin: {
            x: (box.left + box.width / 2) / window.innerWidth,
            y: (box.top + box.height / 2) / window.innerHeight,
          },
          disableForReducedMotion: true,
        })
      }
    } catch (cause) {
      setFailed(cause instanceof ApiError ? cause.message : t.unreachable)
      setPicked(null)
    } finally {
      setBusy(false)
    }
  }

  function advance() {
    if (isLast) {
      void submit()
      return
    }

    setIndex((value) => value + 1)
    setResult(null)
    setPicked(null)
    shownAt.current = Date.now()
  }

  const segments = useMemo(() => {
    if (questions === null) return []

    return questions.map((question, position) => {
      if (verdicts[question.position] === true) return 'ok'
      if (verdicts[question.position] === false) return 'no'

      return position === index ? 'cur' : ''
    })
  }, [questions, verdicts, index])

  if (failed !== null) {
    return (
      <>
        <p className="error">{failed}</p>
        <button type="button" className="btn ghost" onClick={() => navigate(backTo)}>{t.backHome}</button>
      </>
    )
  }

  if (outcome !== null) return <Result outcome={outcome} hue={hue} onDone={() => navigate(backTo)} />

  if (questions === null || current === null) return <p className="sub">{t.loading}</p>

  return (
    <div style={{ ['--hue' as string]: hue }}>
      <div className="quizbar">
        <button type="button" className="icon-btn" onClick={() => navigate(backTo)} aria-label={t.backHome}>←</button>
        <span className="tbadge"><i />{<span>{title}</span>}</span>
        <span className="segs">
          {segments.map((kind, position) => (
            <span key={position} className={kind} />
          ))}
        </span>
      </div>

      <div className="qcard" key={current.position}>
        <p className="qcount">{t.questionOf(index + 1, questions.length)}</p>
        <Markdown as="p" source={current.stem} />

        {current.codeSnippet !== null && (
          <pre><code>{current.codeSnippet}</code></pre>
        )}

        <div className="opts">
          {current.options.map((option, position) => {
            const revealed = result !== null
            const isRight = revealed && result.correctOptionIds.includes(option.id)
            const isPicked = picked === option.id
            const className = !revealed
              ? 'opt'
              : isRight
                ? 'opt right pop'
                : isPicked
                  ? 'opt wrong shake'
                  : 'opt mute'

            return (
              <button
                key={option.id}
                type="button"
                className={className}
                disabled={revealed || busy}
                onClick={(event) => void choose(option.id, event.currentTarget)}
              >
                <span className="ltr">{LETTERS[position] ?? position + 1}</span>
                <span className="body">
                  <Markdown source={option.label} />
                  {revealed && (isRight || isPicked) && result.optionExplanations[option.id] !== undefined && (
                    <Markdown as="span" source={result.optionExplanations[option.id]} />
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {result !== null && (
          <>
            <div className="why">
              <h3>
                {result.isCorrect ? t.verdictRight : t.verdictWrong}
                <span className={`verdict ${result.isCorrect ? 'v-ok' : 'v-no'}`}>
                  {result.isCorrect ? t.xpGain(result.xpAwarded) : t.intoReview}
                </span>
              </h3>
              <Markdown as="p" source={result.explanation} />
              {!result.isCorrect && <div className="rep">↻ {t.repeatNote}</div>}
            </div>

            <button type="button" className="btn" onClick={advance} disabled={busy}>
              {busy ? t.checking : isLast ? t.seeResult : t.next} →
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Result({ outcome, hue, onDone }: { outcome: AttemptResult; hue: string; onDone: () => void }) {
  const { t, locale } = useApp()
  const circumference = 2 * Math.PI * 76
  const ringColour = outcome.passed ? 'var(--ok)' : outcome.score >= 50 ? 'var(--flame)' : 'var(--bad)'

  const headline = outcome.journeyStatus === null
    ? outcome.passed ? t.resultCleared : t.resultBad
    : outcome.passed ? t.resultGood : outcome.score >= 50 ? t.resultMid : t.resultBad

  return (
    <div className="result" style={{ ['--hue' as string]: hue }}>
      <p className="eyebrow">{t.resultDone}</p>
      <h1 style={{ fontSize: 'clamp(24px, 5.6vw, 34px)' }}>{headline}</h1>

      <div className="ring">
        <svg viewBox="0 0 176 176">
          <circle cx="88" cy="88" r="76" fill="none" style={{ stroke: 'var(--hair-2)' }} strokeWidth="11" />
          <circle
            cx="88" cy="88" r="76" fill="none"
            style={{ stroke: ringColour, transition: 'stroke-dashoffset 900ms cubic-bezier(.3,.9,.3,1)' }}
            strokeWidth="11" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * outcome.score) / 100}
          />
        </svg>
        <div className="num">
          <div>
            <b>{outcome.score}</b>
            <span>{t.correctOf(outcome.correctCount, outcome.questionCount)}</span>
          </div>
        </div>
      </div>

      <div className="gain">
        <span className="chip xp">+<b>{outcome.xpEarned}</b> XP</span>
        <span className="chip flame">▲ {t.streakNow(outcome.currentStreak)}</span>
        <span className="chip">{t.accuracy} <b>{outcome.score}%</b></span>
      </div>

      <div className="relist">
        <h3>{outcome.scheduledForReview.length > 0 ? `↻ ${t.queued}` : `✓ ${t.queueEmpty}`}</h3>
        <ul>
          {outcome.scheduledForReview.length === 0 ? (
            <li><span>{t.queueEmpty}</span></li>
          ) : (
            outcome.scheduledForReview.map((entry) => (
              <li key={entry.position}>
                <em>
                  {new Date(entry.dueAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </em>
                <Markdown as="span" source={entry.stem.slice(0, 90)} />
              </li>
            ))
          )}
        </ul>
      </div>

      <button type="button" className="btn ghost" onClick={onDone}>{t.backHome}</button>
    </div>
  )
}
