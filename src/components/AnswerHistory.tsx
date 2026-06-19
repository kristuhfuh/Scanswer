import type { AnswerResult } from '../types'
import styles from './AnswerHistory.module.css'

interface Props {
  history: AnswerResult[]
  onClear: () => void
}

function isMcqLetter(answer: string) {
  return /^[A-Z](\s*(and|or|,)\s*[A-Z])*$/i.test(answer.trim())
}

export default function AnswerHistory({ history, onClear }: Props) {
  if (history.length === 0) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Answers</h3>
        <button className={styles.clearBtn} onClick={onClear}>Clear</button>
      </div>
      <div className={styles.list}>
        {[...history].reverse().map((item) => (
          <div key={item.timestamp} className={styles.item}>
            <span className={`${styles.answer} ${isMcqLetter(item.answer) ? styles.mcq : ''}`}>
              {item.answer}
            </span>
            {item.questionText && (
              <span className={styles.question} title={item.questionText}>
                {item.questionText.slice(0, 80)}{item.questionText.length > 80 ? '…' : ''}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
