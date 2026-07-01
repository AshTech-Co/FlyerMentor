const CATEGORY_LABELS = {
  visual_hierarchy: 'Visual Hierarchy',
  alignment_and_grid: 'Alignment & Grid',
  contrast: 'Contrast',
  whitespace: 'Whitespace',
  typography: 'Typography',
  color_harmony: 'Color Harmony',
}

function scoreBand(score) {
  if (score >= 7) return 'green'
  if (score >= 4) return 'amber'
  return 'red'
}

function ScoreRing({ score }) {
  const band = scoreBand(score)
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const fillColor = band === 'green' ? '#2da44e' : band === 'amber' ? '#d4a017' : '#cf222e'
  const textColor = band === 'green' ? '#1a7f37' : band === 'amber' ? '#9a6700' : '#cf222e'
  const pct = score / 10
  return (
    <div className="score-ring-wrap">
      <div className="score-ring">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="5" />
          <circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke={fillColor}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            strokeLinecap="round"
          />
        </svg>
        <div className="score-ring-value" style={{ color: textColor }}>
          {score.toFixed(1)}
        </div>
      </div>
      <span className="score-ring-label">Overall</span>
    </div>
  )
}

function ScoreRow({ categoryKey, data }) {
  const band = scoreBand(data.score)
  return (
    <div className="score-row">
      <div className="score-row-header">
        <span className="score-label">{CATEGORY_LABELS[categoryKey] ?? categoryKey}</span>
        <span className={`score-num band-${band}`}>{data.score}/10</span>
      </div>
      <div className="score-bar-track">
        <div
          className={`score-bar-fill fill-${band}`}
          style={{ width: `${data.score * 10}%` }}
        />
      </div>
      <span className="score-observation">{data.observation}</span>
    </div>
  )
}

function FixCard({ fix }) {
  return (
    <div className="fix-card">
      <div className="fix-card-badge">
        <span className="fix-card-badge-dot" />
        {CATEGORY_LABELS[fix.category] ?? fix.category}
      </div>
      <h3>Mentor Fix</h3>
      <p>{fix.fix}</p>
    </div>
  )
}

export default function ResultsDashboard({ result, imageUrl, onReset }) {
  const { overall_score, scores, fixes } = result

  const categoryOrder = [
    'visual_hierarchy',
    'alignment_and_grid',
    'contrast',
    'whitespace',
    'typography',
    'color_harmony',
  ]

  return (
    <div>
      {/* Header */}
      <div className="results-header">
        <div className="results-title">
          <h1>Design Critique</h1>
          <p>AI mentor feedback across 6 core design principles</p>
        </div>
        <ScoreRing score={overall_score} />
      </div>

      {/* Two-column: image + scores */}
      <div className="results-grid">
        <div className="image-card">
          <img src={imageUrl} alt="Uploaded design" />
        </div>

        <div className="scores-card">
          <h2>Category Breakdown</h2>
          {categoryOrder.map((key) =>
            scores[key] ? (
              <ScoreRow key={key} categoryKey={key} data={scores[key]} />
            ) : null
          )}
        </div>
      </div>

      {/* Mentor fix cards */}
      {fixes && fixes.length > 0 && (
        <div className="fixes-section">
          <h2>Mentor Fixes — Top {fixes.length} Areas to Improve</h2>
          <div className="fixes-grid">
            {fixes.map((fix, i) => (
              <FixCard key={i} fix={fix} />
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="action-bar">
        <button className="btn btn-primary" onClick={onReset}>
          Analyze another design
        </button>
      </div>
    </div>
  )
}
