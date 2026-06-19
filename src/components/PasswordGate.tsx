import { useState } from 'react'
import styles from './PasswordGate.module.css'

interface Props {
  onUnlock: (password: string) => void
  error: string | null
  loading: boolean
}

export default function PasswordGate({ onUnlock, error, loading }: Props) {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.trim()) onUnlock(password.trim())
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#grad2)" />
            <circle cx="14" cy="14" r="7" stroke="#fff" strokeWidth="2.5" fill="none" />
            <line x1="19" y1="19" x2="26" y2="26" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="11" y1="14" x2="17" y2="14" stroke="#00c896" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="11" x2="14" y2="17" stroke="#00c896" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="grad2" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className={styles.title}>Scanswer</h1>
        <p className={styles.subtitle}>Enter the access password to continue</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputRow}>
            <input
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              type={visible ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setVisible((v) => !v)}
              tabIndex={-1}
            >
              {visible ? '🙈' : '👁️'}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={!password.trim() || loading}>
            {loading ? <span className={styles.spinner} /> : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}
