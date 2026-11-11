import { useCallback, useEffect, useMemo, useState } from 'react'
import { setUnauthorizedHandler } from './api'
import { AppContext, THEME_ORDER, type AppState, type ThemeChoice } from './app-state'
import { auth } from './auth'
import { stringsFor } from './strings'
import type { Locale, User } from './types'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // a private window or blocked storage is not an error worth surfacing
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [booting, setBooting] = useState(true)
  const [locale, setLocaleState] = useState<Locale>(() => (read('bj-locale') === 'en' ? 'en' : 'id'))
  const [theme, setTheme] = useState<ThemeChoice>(
    () => (THEME_ORDER.find((candidate) => candidate === read('bj-theme')) ?? 'auto'),
  )

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))

    return () => setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    auth
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setBooting(false))
  }, [])

  const [systemLight, setSystemLight] = useState(
    () => window.matchMedia('(prefers-color-scheme: light)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: light)')
    const listen = (event: MediaQueryListEvent) => setSystemLight(event.matches)

    query.addEventListener('change', listen)

    return () => query.removeEventListener('change', listen)
  }, [])

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'auto') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)

    write('bj-theme', theme)
  }, [theme])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    write('bj-locale', next)
  }, [])

  const cycleTheme = useCallback(() => {
    setTheme((current) => THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length])
  }, [])

  const signOut = useCallback(async () => {
    await auth.logout()
    setUser(null)
  }, [])

  const value = useMemo<AppState>(
    () => ({
      user,
      booting,
      locale,
      theme,
      isLight: theme === 'auto' ? systemLight : theme === 'light',
      t: stringsFor(locale),
      setUser,
      setLocale,
      cycleTheme,
      signOut,
    }),
    [user, booting, locale, theme, systemLight, setLocale, cycleTheme, signOut],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
