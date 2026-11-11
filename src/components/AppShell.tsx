import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../lib/app-state'
import { ChartIcon, HomeIcon, MapIcon, ReviewIcon } from './Icons'
import { Palette } from './Palette'

const THEME_GLYPH = { auto: '◐', light: '☀', dark: '☾' } as const

export function AppShell({ dueCount }: { dueCount: number }) {
  const { user, locale, setLocale, theme, cycleTheme, t, signOut } = useApp()

  const themeLabel = theme === 'auto' ? t.themeAuto : theme === 'light' ? t.themeLight : t.themeDark

  return (
    <>
      <div className="mesh" aria-hidden="true">
        <i /><i /><i /><i />
      </div>

      <div className="shell">
        <header className="topbar">
          <div className="mark">
            <span className="glyph">◆</span> <span>Backend Journey</span>
          </div>
          <span className="spacer" />

          <Palette />

          <button type="button" className="icon-btn" onClick={cycleTheme} title={themeLabel} aria-label={themeLabel}>
            {THEME_GLYPH[theme]}
          </button>

          <div className="lang" role="group" aria-label="Language">
            <button type="button" aria-pressed={locale === 'id'} onClick={() => setLocale('id')}>id</button>
            <button type="button" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>en</button>
          </div>

          <span className="chip flame">▲ <b>{user?.currentStreak ?? 0}</b></span>
          <button type="button" className="icon-btn" onClick={signOut} title={t.signOut} aria-label={t.signOut}>⏻</button>
        </header>

        <main>
          <Outlet />
        </main>
      </div>

      <nav className="tabs">
        <NavLink to="/" end>
          <HomeIcon />
          <span>{t.navHome}</span>
        </NavLink>
        <NavLink to="/roadmap">
          <MapIcon />
          <span>{t.navMap}</span>
        </NavLink>
        <NavLink to="/review">
          <ReviewIcon />
          <span>{t.navReview}</span>
          {dueCount > 0 && <span className="dot">{dueCount}</span>}
        </NavLink>
        <NavLink to="/insights">
          <ChartIcon />
          <span>{t.navInsights}</span>
        </NavLink>
      </nav>
    </>
  )
}
