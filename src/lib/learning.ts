import { api } from './api'
import type {
  Achievement,
  AnswerResult,
  Attempt,
  AttemptResult,
  Envelope,
  Insight,
  JourneySearch,
  Locale,
  ReviewSummary,
  Roadmap,
  ServedQuestion,
  TrackDetail,
} from './types'

const unwrap = <T,>(response: Envelope<T>): T => response.data

export const learning = {
  roadmap: (locale: Locale) => api<Envelope<Roadmap>>('/roadmap', { locale }).then(unwrap),

  insights: (locale: Locale) => api<Envelope<Insight>>('/insights', { locale }).then(unwrap),

  journeys: (locale: Locale) =>
    api<Envelope<JourneySearch[]>>('/journeys', { locale }).then(unwrap),

  track: (slug: string, locale: Locale) =>
    api<Envelope<TrackDetail>>(`/tracks/${slug}`, { locale }).then(unwrap),

  achievements: (locale: Locale) =>
    api<Envelope<Achievement[]>>('/achievements', { locale }).then(unwrap),

  reviewSummary: (locale: Locale) =>
    api<Envelope<ReviewSummary>>('/review', { locale }).then(unwrap),

  startReview: (locale: Locale) =>
    api<Envelope<Attempt>>('/review/attempts', { method: 'POST', locale }).then(unwrap),

  startQuiz: (quizSlug: string, locale: Locale) =>
    api<Envelope<Attempt>>(`/quizzes/${quizSlug}/attempts`, { method: 'POST', locale }).then(unwrap),

  questions: (attemptId: number, locale: Locale) =>
    api<Envelope<ServedQuestion[]>>(`/attempts/${attemptId}/questions`, { locale }).then(unwrap),

  answer: (
    attemptId: number,
    position: number,
    optionIds: number[],
    timeSpentMs: number | null,
    locale: Locale,
  ) =>
    api<Envelope<AnswerResult>>(`/attempts/${attemptId}/answers`, {
      method: 'POST',
      locale,
      body: { position, optionIds, timeSpentMs },
    }).then(unwrap),

  submit: (attemptId: number, locale: Locale) =>
    api<Envelope<AttemptResult>>(`/attempts/${attemptId}/submit`, { method: 'POST', locale }).then(unwrap),
}
