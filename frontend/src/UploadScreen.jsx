import { useRef, useState } from 'react'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'

export default function UploadScreen({ onAnalyze, loading }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)

  function handleFile(f) {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleChange(e) {
    handleFile(e.target.files[0])
  }

  function handleSubmit() {
    if (file) onAnalyze(file)
  }

  return (
    <div className="upload-screen">
      <div className="upload-intro">
        <h1>Upload your flyer</h1>
        <p>
          Drop a PNG, JPG, or WebP flyer and get structured feedback from your
          AI design mentor — scores, observations, and concrete fixes.
        </p>
      </div>

      <label
        className={`drop-zone${dragOver ? ' drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleChange} />

        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{ maxHeight: 220, maxWidth: '100%', borderRadius: 6, pointerEvents: 'none' }}
          />
        ) : (
          <>
            <div className="drop-zone-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h2>Drag & drop your design here</h2>
            <p>or click to browse · PNG, JPG, WebP · max 20 MB</p>
          </>
        )}
      </label>

      {file && (
        <div style={{ fontSize: 13, color: '#57606a' }}>
          <strong>{file.name}</strong> · {(file.size / 1024).toFixed(0)} KB
        </div>
      )}

      <button
        className="btn btn-primary"
        disabled={!file || loading}
        onClick={handleSubmit}
        style={{ minWidth: 180, justifyContent: 'center' }}
      >
        {loading ? 'Analyzing…' : 'Analyze with AI Mentor'}
      </button>
    </div>
  )
}
