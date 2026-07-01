import { useState } from 'react'
import axios from 'axios'
import LoginPage from './LoginPage'
import SignUpPage from './SignUpPage'
import UploadScreen from './UploadScreen'
import LoadingScreen from './LoadingScreen'
import ResultsDashboard from './ResultsDashboard'
import './index.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  // auth: 'login' | 'signup' | 'app'
  const [auth, setAuth] = useState('login')
  const [user, setUser] = useState(null)

  // app flow: 'upload' | 'loading' | 'results' | 'error'
  const [state, setState] = useState('upload')
  const [result, setResult] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [error, setError] = useState(null)

  function handleLogin(u) {
    setUser(u)
    setAuth('app')
  }

  function handleSignUp(u) {
    setUser(u)
    setAuth('app')
  }

  function handleLogout() {
    setUser(null)
    setAuth('login')
    handleReset()
  }

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

  // ── Auth screens (no shell header) ──────────────────────────────────────
  if (auth === 'login') {
    return <LoginPage onLogin={handleLogin} onGoSignUp={() => setAuth('signup')} />
  }

  if (auth === 'signup') {
    return <SignUpPage onSignUp={handleSignUp} onGoLogin={() => setAuth('login')} />
  }

  // ── Main app ─────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <header className="header">
        <span className="header-logo">
          Flyer<span>Mentor</span>
        </span>
        <span className="header-tag">AI Design Critic</span>

        <nav className="header-nav">
          <span className="header-user">
            Hello, <strong>{user?.name ?? 'there'}</strong>
          </span>
          <button className="btn btn-secondary" style={{ padding: '6px 14px' }} onClick={handleLogout}>
            Sign out
          </button>
        </nav>
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
