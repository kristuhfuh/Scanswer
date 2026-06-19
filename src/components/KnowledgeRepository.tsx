import { useRef, useState } from 'react'
import type { KnowledgeDocument } from '../types'
import { parsePdf, parseTxt } from '../services/documentParser'
import styles from './KnowledgeRepository.module.css'

interface Props {
  documents: KnowledgeDocument[]
  onAdd: (doc: KnowledgeDocument) => void
  onRemove: (id: string) => void
}

export default function KnowledgeRepository({ documents, onAdd, onRemove }: Props) {
  const [pasteText, setPasteText] = useState('')
  const [pasteName, setPasteName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setError('')
    setLoading(true)
    try {
      for (const file of Array.from(files)) {
        let content = ''
        let type: KnowledgeDocument['type'] = 'txt'
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          content = await parsePdf(file)
          type = 'pdf'
        } else {
          content = await parseTxt(file)
          type = 'txt'
        }
        onAdd({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          content,
          type,
          addedAt: Date.now(),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleAddPaste() {
    if (!pasteText.trim()) return
    onAdd({
      id: `${Date.now()}-${Math.random()}`,
      name: pasteName.trim() || `Text snippet ${documents.length + 1}`,
      content: pasteText,
      type: 'text',
      addedAt: Date.now(),
    })
    setPasteText('')
    setPasteName('')
    setShowPaste(false)
  }

  const totalChars = documents.reduce((s, d) => s + d.content.length, 0)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>Knowledge Base</h2>
        {documents.length > 0 && (
          <span className={styles.badge}>{documents.length}</span>
        )}
      </div>

      {documents.length > 0 && (
        <p className={styles.stats}>
          {documents.length} doc{documents.length !== 1 ? 's' : ''} &middot;{' '}
          {(totalChars / 1000).toFixed(1)}k chars
        </p>
      )}

      <div className={styles.actions}>
        <button
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          )}
          Upload PDF / TXT
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.text"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button
          className={`${styles.pasteBtn} ${showPaste ? styles.active : ''}`}
          onClick={() => setShowPaste((v) => !v)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="9" y="2" width="6" height="4" rx="1"/>
            <path d="M17 4h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1"/>
          </svg>
          Paste Text
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {showPaste && (
        <div className={styles.pastePanel}>
          <input
            className={styles.nameInput}
            placeholder="Document name (optional)"
            value={pasteName}
            onChange={(e) => setPasteName(e.target.value)}
          />
          <textarea
            className={styles.pasteArea}
            placeholder="Paste your text, notes, or study material here..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={6}
          />
          <div className={styles.pasteActions}>
            <button className={styles.cancelBtn} onClick={() => setShowPaste(false)}>
              Cancel
            </button>
            <button
              className={styles.addBtn}
              onClick={handleAddPaste}
              disabled={!pasteText.trim()}
            >
              Add to Knowledge Base
            </button>
          </div>
        </div>
      )}

      <div className={styles.docList}>
        {documents.length === 0 ? (
          <div className={styles.empty}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>No documents yet</p>
            <p>Upload files or paste text to begin</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className={styles.docItem}>
              <span className={styles.docIcon}>
                {doc.type === 'pdf' ? '📄' : doc.type === 'text' ? '📝' : '📃'}
              </span>
              <div className={styles.docInfo}>
                <span className={styles.docName} title={doc.name}>{doc.name}</span>
                <span className={styles.docSize}>
                  {(doc.content.length / 1000).toFixed(1)}k chars
                </span>
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => onRemove(doc.id)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
