import { useState } from 'react'
import axios from 'axios'
import UploadScreen from './UploadScreen'
import LoadingScreen from './LoadingScreen'
import ResultsDashboard from './ResultsDashboard'
import './index.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [state, setState] = useState('upload') // 'upload' | 'loading' | 'results' | 'error'
  const [result, setResult] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [error, setError] = useState(null)

  async function handleAnalyze(file) {
    setError(null)
    setImageUrl(URL.createObjectURL(file))
    setState('loading')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      })
      setResult(res.data)
      setState('results')
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Unknown error'
      setError(detail)
      setState('error')
    }
  }

  function handleReset() {
    setResult(null)
    setImageUrl(null)
    setError(null)
    setState('upload')
  }

  return (
    <div className="app">
      <header className="header">
        <span className="header-logo">
          Flyer<span>Mentor</span>
        </span>
        <span className="header-tag">AI Design Critic</span>
      </header>

      <main className="main">
        <div className="container">
          {state === 'error' && (
            <div className="error-box">
              <strong>Something went wrong:</strong> {error}
              <br />
              <button
                className="btn btn-secondary"
                style={{ marginTop: 12 }}
                onClick={handleReset}
              >
                Try again
              </button>
            </div>
          )}

          {(state === 'upload' || state === 'error') && (
            <UploadScreen
              onAnalyze={handleAnalyze}
              loading={state === 'loading'}
            />
          )}

          {state === 'loading' && <LoadingScreen />}

          {state === 'results' && result && (
            <ResultsDashboard
              result={result}
              imageUrl={imageUrl}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        Made with IBM Bob &nbsp;·&nbsp; FlyerMentor — AI Design Mentor
      </footer>
    </div>
  )
}
