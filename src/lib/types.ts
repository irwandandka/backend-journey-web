export type Locale = 'en' | 'id'

export type User = {
  id: number
  name: string
  email: string
  locale: Locale
  xpTotal: number
  currentStreak: number
  longestStreak: number
  lastActiveOn: string | null
  roles: string[]
}

export type Tier = 'foundation' | 'intermediate' | 'advanced' | 'deep'

export type JourneyStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export type TrackSummary = {
  slug: string
  name: string
  description: string | null
  abbreviation: string
  colorDark: string
  colorLight: string
  position: number
  journeyCount: number
  completedCount: number
  dueCount: number
}

export type Roadmap = {
  slug: string
  title: string
  description: string | null
  tracks: TrackSummary[]
}

export type Journey = {
  slug: string
  title: string
  description: string | null
  tier: Tier
  position: number
  status: JourneyStatus
  bestScore: number | null
  attemptsCount: number
  passThreshold: number
  quizSlug: string | null
  questionCount: number
}

export type TrackDetail = {
  slug: string
  name: string
  description: string | null
  abbreviation: string
  colorDark: string
  colorLight: string
  journeys: Journey[]
}

export type Attempt = {
  id: number
  kind: 'quiz' | 'review'
  quizSlug: string | null
  status: 'in_progress' | 'submitted' | 'abandoned'
  locale: Locale
  questionCount: number
  answeredCount: number
  startedAt: string
}

export type ServedOption = { id: number; label: string }

export type ServedQuestion = {
  position: number
  stem: string
  codeSnippet: string | null
  codeLanguage: string | null
  answered: boolean
  options: ServedOption[]
}

export type AnswerResult = {
  position: number
  isCorrect: boolean
  correctOptionIds: number[]
  explanation: string | null
  optionExplanations: Record<string, string>
  xpAwarded: number
  answeredCount: number
  questionCount: number
}

export type AttemptResult = {
  score: number
  correctCount: number
  questionCount: number
  passed: boolean
  xpEarned: number
  xpTotal: number
  currentStreak: number
  journeyStatus: JourneyStatus | null
  scheduledForReview: { position: number; stem: string; dueAt: string }[]
}

export type ReviewSummary = {
  dueCount: number
  trackedCount: number
  nextDueAt: string | null
  sessionSize: number
}

export type Envelope<T> = { data: T }
