import { createContext, useContext } from 'react'
import type { Strings } from './strings'
import type { Locale, User } from './types'

export type ThemeChoice = 'auto' | 'light' | 'dark'

export type AppState = {
  user: User | null
  booting: boolean
  locale: Locale
  theme: ThemeChoice
  isLight: boolean
  t: Strings
  setUser: (user: User | null) => void
  setLocale: (locale: Locale) => void
  cycleTheme: () => void
  signOut: () => Promise<void>
}

export const AppContext = createContext<AppState | null>(null)

export const THEME_ORDER: ThemeChoice[] = ['auto', 'light', 'dark']

export function useApp(): AppState {
  const value = useContext(AppContext)

  if (value === null) throw new Error('useApp must be used inside AppProvider')

  return value
}
