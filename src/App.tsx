import { useState, useCallback } from 'react'
import type { KnowledgeDocument, AnswerResult } from './types'
import KnowledgeRepository from './components/KnowledgeRepository'
import QuestionPanel from './components/QuestionPanel'
import AnswerDisplay from './components/AnswerDisplay'
import AnswerHistory from './components/AnswerHistory'
import PasswordGate from './components/PasswordGate'
import { queryKnowledgeBase } from './services/claudeService'
import styles from './App.module.css'

export default function App() {
  const [password, setPassword] = useState(() => sessionStorage.getItem('scanswer_pw') ?? '')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwLoading, setPwLoading] = useState(false)

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [history, setHistory] = useState<AnswerResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUnlock(pw: string) {
    setPwLoading(true)
    setPwError(null)
    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, question: 'ping', knowledgeContent: '' }),
      })
      if (res.status === 401) {
        setPwError('Incorrect password. Try again.')
      } else if (res.ok) {
        sessionStorage.setItem('scanswer_pw', pw)
        setPassword(pw)
      } else {
        setPwError('Server error. Make sure environment variables are set on Vercel.')
      }
    } catch {
      setPwError('Could not reach the server. Try again.')
    } finally {
      setPwLoading(false)
    }
  }

  function addDocument(doc: KnowledgeDocument) {
    setDocuments((prev) => [...prev, doc])
  }

  function removeDocument(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  const handleQuestion = useCallback(
    async (question: string, imageBase64?: string, imageMimeType?: string) => {
      setLoading(true)
      setError(null)
      setResult(null)
      try {
        const knowledgeContent = documents.map((d) => `[${d.name}]\n${d.content}`).join('\n\n---\n\n')
        const answer = await queryKnowledgeBase(password, question, knowledgeContent, imageBase64, imageMimeType)
        const entry: AnswerResult = {
          answer,
          questionText: question,
          sourceDocs: documents.map((d) => d.name),
          timestamp: Date.now(),
        }
        setResult(entry)
        setHistory((prev) => [...prev, entry])
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        if (msg.toLowerCase().includes('incorrect password')) {
          sessionStorage.removeItem('scanswer_pw')
          setPassword('')
        }
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [password, documents],
  )

  if (!password) {
    return <PasswordGate onUnlock={handleUnlock} error={pwError} loading={pwLoading} />
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#grad)" />
            <circle cx="14" cy="14" r="7" stroke="#fff" strokeWidth="2.5" fill="none" />
            <line x1="19" y1="19" x2="26" y2="26" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="11" y1="14" x2="17" y2="14" stroke="#00c896" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="11" x2="14" y2="17" stroke="#00c896" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
            </defs>
          </svg>
          <span className={styles.brandName}>Scanswer</span>
          <span className={styles.tagline}>AI-powered answer scanner</span>
        </div>
        <button
          className={styles.lockBtn}
          onClick={() => { sessionStorage.removeItem('scanswer_pw'); setPassword('') }}
          title="Lock / sign out"
        >
          🔒 Lock
        </button>
      </header>

      <div className={styles.body}>
        <KnowledgeRepository
          documents={documents}
          onAdd={addDocument}
          onRemove={removeDocument}
        />
        <main className={styles.main}>
          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Question</h3>
            <QuestionPanel
              onSubmit={handleQuestion}
              loading={loading}
              hasDocuments={documents.length > 0}
              hasApiKey={true}
            />
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Answer</h3>
            <AnswerDisplay result={result} error={error} loading={loading} />
          </div>
          <AnswerHistory history={history} onClear={() => setHistory([])} />
        </main>
      </div>
    </div>
  )
}
