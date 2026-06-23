import { useRef, useState } from 'react'
import type { ExcelSheet } from '../types'
import { parseExcelStructured } from '../services/documentParser'
import styles from './TenantLookup.module.css'

interface MatchedRow {
  sheetName: string
  headers: string[]
  row: string[]
  key: string
}

export default function TenantLookup() {
  const [sheets, setSheets] = useState<ExcelSheet[]>([])
  const [fileName, setFileName] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const data = await parseExcelStructured(file)
      setSheets(data)
      setFileName(file.name)
      setQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const q = query.trim().toLowerCase()

  const matches: MatchedRow[] = !q
    ? []
    : sheets.flatMap((sheet) =>
        sheet.rows
          .map((row, i) => ({ sheetName: sheet.name, headers: sheet.headers, row, key: `${sheet.name}-${i}` }))
          .filter(({ row }) => row.some((cell) => cell.toLowerCase().includes(q)))
      )

  const totalRows = sheets.reduce((sum, s) => sum + s.rows.length, 0)

  return (
    <div className={styles.container}>
      <div className={styles.uploadSection}>
        <button
          className={styles.uploadBtn}
          onClick={() => fileRef.current?.click()}
          disabled={loading}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {loading ? 'Loading…' : sheets.length > 0 ? 'Replace Excel file' : 'Upload Excel file'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        {sheets.length > 0 && (
          <span className={styles.fileInfo}>
            <span className={styles.fileName}>{fileName}</span>
            <span className={styles.fileMeta}>
              {sheets.length} sheet{sheets.length !== 1 ? 's' : ''} &middot; {totalRows} rows
            </span>
          </span>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {sheets.length === 0 && !loading && (
        <div className={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          <p>Upload an Excel file to start searching</p>
          <p className={styles.emptyHint}>Supports .xlsx, .xls, and .csv files with headers in the first row</p>
        </div>
      )}

      {sheets.length > 0 && (
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.search}
            placeholder="Search by name, category, location, hours…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')} title="Clear">
              ✕
            </button>
          )}
        </div>
      )}

      {q && matches.length === 0 && (
        <p className={styles.noResults}>No results for "{query}"</p>
      )}

      {q && matches.length > 0 && (
        <p className={styles.resultCount}>{matches.length} result{matches.length !== 1 ? 's' : ''}</p>
      )}

      <div className={styles.results}>
        {matches.map(({ sheetName, headers, row, key }) => (
          <div key={key} className={styles.card}>
            <div className={styles.cardSheet}>{sheetName}</div>
            <div className={styles.fields}>
              {headers.map((header, i) =>
                row[i]?.trim() ? (
                  <div key={i} className={styles.field}>
                    <span className={styles.fieldLabel}>{header}</span>
                    <span className={styles.fieldValue}>{row[i]}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
