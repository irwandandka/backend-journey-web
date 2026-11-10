import { useState } from 'react'
import { ApiError } from '../lib/api'
import { useApp } from '../lib/app-state'
import { auth } from '../lib/auth'

export function Login() {
  const { t, setUser } = useApp()
  const [email, setEmail] = useState('learner@backendjourney.test')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      setUser(await auth.login(email, password))
    } catch (cause) {
      setError(cause instanceof ApiError ? (cause.firstError('email') ?? cause.message) : t.unreachable)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="mesh" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="shell">
        <header className="topbar">
          <div className="mark"><span className="glyph">◆</span> <span>Backend Journey</span></div>
        </header>
        <h1><em>Backend Journey</em></h1>
        <p className="sub">{t.signInLead}</p>
        <form onSubmit={submit}>
          <label htmlFor="email">{t.email}</label>
          <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="password">{t.password}</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error !== null && <p className="error">{error}</p>}
          <button type="submit" className="btn" disabled={busy}>{busy ? t.signingIn : t.signIn}</button>
        </form>
      </div>
    </>
  )
}
