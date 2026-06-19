import { useState } from 'react'
import styles from './ApiKeyInput.module.css'

interface Props {
  apiKey: string
  onChange: (key: string) => void
}

export default function ApiKeyInput({ apiKey, onChange }: Props) {
  const [visible, setVisible] = useState(false)
  const [editing, setEditing] = useState(!apiKey)

  const masked = apiKey ? `sk-ant-••••••••${apiKey.slice(-4)}` : ''

  if (!editing && apiKey) {
    return (
      <div className={styles.saved}>
        <span className={styles.keyIcon}>🔑</span>
        <span className={styles.masked}>{masked}</span>
        <button className={styles.editBtn} onClick={() => setEditing(true)}>
          Change
        </button>
      </div>
    )
  }

  return (
    <div className={styles.inputRow}>
      <span className={styles.keyIcon}>🔑</span>
      <input
        className={styles.input}
        type={visible ? 'text' : 'password'}
        placeholder="Paste your Anthropic API key (sk-ant-...)"
        value={apiKey}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      <button
        className={styles.toggleBtn}
        onClick={() => setVisible((v) => !v)}
        type="button"
        title={visible ? 'Hide' : 'Show'}
      >
        {visible ? '🙈' : '👁️'}
      </button>
      {apiKey && (
        <button
          className={styles.saveBtn}
          onClick={() => setEditing(false)}
          type="button"
        >
          Save
        </button>
      )}
    </div>
  )
}
