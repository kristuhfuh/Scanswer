import type { AnswerResult } from '../types'
import styles from './AnswerDisplay.module.css'

interface Props {
  result: AnswerResult | null
  error: string | null
  loading: boolean
}

function isMcqLetter(answer: string) {
  return /^[A-Z](\s*(and|or|,)\s*[A-Z])*$/i.test(answer.trim())
}

export default function AnswerDisplay({ result, error, loading }: Props) {
  if (loading) {
    return (
      <div className={`${styles.card} ${styles.loading}`}>
        <div className={styles.orb} />
        <p className={styles.loadingText}>Scanning knowledge base...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.errorCard}`}>
        <div className={styles.errorIcon}>⚠️</div>
        <div>
          <p className={styles.errorTitle}>Something went wrong</p>
          <p className={styles.errorMsg}>{error}</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className={`${styles.card} ${styles.empty}`}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>Your answer will appear here</p>
      </div>
    )
  }

  const isMcq = isMcqLetter(result.answer)
  const notFound = result.answer.toLowerCase().includes('not found')

  return (
    <div className={`${styles.card} ${styles.result} ${isMcq ? styles.mcq : ''} ${notFound ? styles.notFound : ''}`}>
      <div className={styles.answerWrap}>
        {isMcq ? (
          <div className={styles.letterBadge}>{result.answer.toUpperCase()}</div>
        ) : (
          <p className={`${styles.answerText} ${notFound ? styles.muted : ''}`}>
            {result.answer}
          </p>
        )}
      </div>

      {result.questionText && (
        <div className={styles.questionPreview}>
          <span className={styles.questionLabel}>Q:</span>
          <span className={styles.questionText}>{result.questionText}</span>
        </div>
      )}

      <div className={styles.meta}>
        <span className={styles.time}>
          {new Date(result.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}
