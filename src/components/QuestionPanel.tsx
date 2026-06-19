import { useRef, useState } from 'react'
import type { QuestionInputMode } from '../types'
import { imageFileToBase64 } from '../services/documentParser'
import styles from './QuestionPanel.module.css'

interface Props {
  onSubmit: (question: string, imageBase64?: string, imageMimeType?: string) => void
  loading: boolean
  hasDocuments: boolean
  hasApiKey: boolean
}

export default function QuestionPanel({ onSubmit, loading, hasDocuments, hasApiKey }: Props) {
  const [mode, setMode] = useState<QuestionInputMode>('text')
  const [question, setQuestion] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    if (mode === 'image' && imageFile) {
      const b64 = await imageFileToBase64(imageFile)
      onSubmit('', b64, imageFile.type)
    } else if (question.trim()) {
      onSubmit(question.trim())
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  function clearImage() {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    if (imgInputRef.current) imgInputRef.current.value = ''
  }

  const canSubmit =
    hasApiKey &&
    !loading &&
    (mode === 'text' ? question.trim().length > 0 : imageFile !== null)

  return (
    <div className={styles.panel}>
      <div className={styles.modeSwitch}>
        <button
          className={`${styles.modeBtn} ${mode === 'text' ? styles.active : ''}`}
          onClick={() => setMode('text')}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Type Question
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'image' ? styles.active : ''}`}
          onClick={() => setMode('image')}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Scan Image
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {mode === 'text' ? (
          <div className={styles.textInputWrap}>
            <textarea
              className={styles.textarea}
              placeholder="Type your question here... (e.g. 'What is the powerhouse of the cell?' or 'Which option is correct: A. ... B. ... C. ...')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e)
              }}
            />
            <span className={styles.hint}>Ctrl+Enter to submit</span>
          </div>
        ) : (
          <div className={styles.imageZone}>
            {imagePreview ? (
              <div className={styles.previewWrap}>
                <img src={imagePreview} alt="Question" className={styles.preview} />
                <button className={styles.clearImg} onClick={clearImage} type="button">
                  ✕ Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.dropZone}
                onClick={() => imgInputRef.current?.click()}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Click to upload a photo of the question</span>
                <span className={styles.supportedFormats}>JPG, PNG, WEBP, GIF</span>
              </button>
            )}
            <input
              ref={imgInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
          </div>
        )}

        {!hasApiKey && (
          <p className={styles.warn}>Add your Anthropic API key above to get answers.</p>
        )}
        {!hasDocuments && hasApiKey && (
          <p className={styles.warn}>Add documents to the knowledge base for accurate answers.</p>
        )}

        <button className={styles.submitBtn} type="submit" disabled={!canSubmit}>
          {loading ? (
            <>
              <span className={styles.spinner} />
              Scanning...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Get Answer
            </>
          )}
        </button>
      </form>
    </div>
  )
}
