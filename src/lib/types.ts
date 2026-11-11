// The App.Data.* shapes come from src/types/api.d.ts, generated out of the
// Laravel Data DTOs. Run `npm run sync:types` after changing a DTO.

export type Locale = 'en' | 'id'
export type Tier = 'foundation' | 'intermediate' | 'advanced' | 'deep'
export type JourneyStatus = 'locked' | 'available' | 'in_progress' | 'completed'
export type AttemptKind = 'quiz' | 'review'
export type AttemptStatus = 'in_progress' | 'submitted' | 'abandoned'

// PHP has no enum for these yet, so the generated type says `string`. Narrowing
// through Omit keeps the rest of the shape generated. If the API renames or drops
// a narrowed field, M holds a key T does not, and the result collapses to an
// error type so every use site fails to compile.
type Unknown<T, M> = Exclude<keyof M, keyof T>

type Narrow<T, M> = [Unknown<T, M>] extends [never]
  ? Omit<T, keyof M> & M
  : { 'narrowed a field the API does not send': Unknown<T, M> }

export type User = Narrow<App.Data.UserData, { locale: Locale }>

export type TrackSummary = App.Data.TrackSummaryData

export type Roadmap = App.Data.RoadmapData

export type Journey = Narrow<App.Data.JourneyData, { tier: Tier; status: JourneyStatus }>

export type TrackDetail = Narrow<App.Data.TrackDetailData, { journeys: Journey[] }>

export type Attempt = Narrow<
  App.Data.AttemptData,
  { kind: AttemptKind; status: AttemptStatus; locale: Locale }
>

export type ServedQuestion = App.Data.ServedQuestionData

export type ServedOption = ServedQuestion['options'][number]

export type AnswerResult = App.Data.AnswerResultData

export type AttemptResult = Narrow<
  App.Data.AttemptResultData,
  { journeyStatus: JourneyStatus | null }
>

export type Achievement = App.Data.AchievementData

export type ReviewSummary = App.Data.ReviewSummaryData

export type Envelope<T> = { data: T }
