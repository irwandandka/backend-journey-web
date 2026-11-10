import { useEffect, useState } from 'react'
import { ApiError } from './lib/api'
import { auth } from './lib/auth'
import type { User } from './lib/types'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [booting, setBooting] = useState(true)
  const [email, setEmail] = useState('learner@backendjourney.test')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    auth
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setBooting(false))
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      setUser(await auth.login(email, password))
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? (cause.firstError('email') ?? cause.message)
          : 'Could not reach the API',
      )
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    await auth.logout()
    setUser(null)
  }

  if (booting) return <main className="shell">Loading…</main>

  if (user === null) {
    return (
      <main className="shell">
        <h1>Backend Journey</h1>
        <p className="muted">Sign in to continue your roadmap.</p>
        <form onSubmit={submit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error !== null && <p className="error">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </main>
    )
  }

  return (
    <main className="shell">
      <h1>Hi, {user.name}</h1>
      <dl>
        <dt>Email</dt><dd>{user.email}</dd>
        <dt>Locale</dt><dd>{user.locale}</dd>
        <dt>XP</dt><dd>{user.xpTotal}</dd>
        <dt>Streak</dt><dd>{user.currentStreak} days</dd>
        <dt>Roles</dt><dd>{user.roles.join(', ')}</dd>
      </dl>
      <button type="button" onClick={signOut}>Sign out</button>
    </main>
  )
}
