import { useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { runScan } from '../lib/api.js'

const STEPS = [
  'Resolving DNS...',
  'Checking SSL certificate...',
  'Querying VirusTotal...',
  'Auditing cookies & headers...',
  'Running AI analysis...',
]

const SEV_COLOR = {
  critical: '#ff3b1f',
  high:     '#ff7a1f',
  medium:   '#ffaa44',
  low:      'rgba(255,245,240,0.5)',
  pass:     '#4ade80',
  skipped:  'rgba(255,245,240,0.2)',
  error:    '#ff3b1f',
}

const SEV_ORDER = { critical:0, high:1, medium:2, low:3, pass:4, skipped:5, error:6 }

function calcScore(results) {
  if (!results?.length) return 0
  const weights = { critical:0, high:20, medium:10, low:5, pass:0, skipped:0, error:15 }
  const maxLoss  = results.length * 20
  const loss     = results.reduce((acc, r) => acc + (weights[r.severity] || 0), 0)
  return Math.max(0, Math.round(100 - (loss / maxLoss) * 100))
}

function scoreLabel(score) {
  if (score >= 90) return { label:'Excellent',  color:'#4ade80' }
  if (score >= 75) return { label:'Good',       color:'#ffaa44' }
  if (score >= 55) return { label:'Fair',       color:'#ff7a1f' }
  if (score >= 35) return { label:'Poor',       color:'#ff3b1f' }
  return                   { label:'Critical',  color:'#ff3b1f' }
}

// Animated SVG score ring
function ScoreRing({ score, animated }) {
  const r   = 70
  const circ = 2 * Math.PI * r
  const [display, setDisplay] = useState(0)
  const { label, color } = scoreLabel(score)

  useEffect(() => {
    if (!animated) return
    let cur = 0
    const step = score / 60
    const t = setInterval(() => {
      cur += step
      if (cur >= score) { setDisplay(score); clearInterval(t) }
      else setDisplay(Math.floor(cur))
    }, 16)
    return () => clearInterval(t)
  }, [score, animated])

  const offset = circ - (display / 100) * circ

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <svg width="180" height="180" style={{ transform:'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="90" cy="90" r={r} fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition:'stroke-dashoffset 0.05s linear, stroke 0.5s', filter:`drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div style={{ position:'absolute', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <span style={{ fontSize:42, fontWeight:800, letterSpacing:-2, lineHeight:1, background:`linear-gradient(135deg,${color},#ffaa44)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{display}</span>
        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'rgba(255,245,240,0.4)', letterSpacing:1, marginTop:2 }}>/100</span>
        <span style={{ fontSize:13, fontWeight:700, color, marginTop:4 }}>{label}</span>
      </div>
    </div>
  )
}

// Individual module card
function ModuleCard({ result }) {
  const [open, setOpen] = useState(false)
  const col = SEV_COLOR[result.severity] || 'rgba(255,245,240,0.35)'

  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{ background:'rgba(20,8,4,0.65)', border:`1px solid ${open ? col+'55' : 'rgba(255,255,255,0.07)'}`, borderRadius:14, padding:'18px 22px', backdropFilter:'blur(16px)', cursor:'pointer', transition:'all .25s', marginBottom:10 }}
      onMouseOver={e => e.currentTarget.style.borderColor = col+'44'}
      onMouseOut={e  => { if (!open) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
    >
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:10, height:10, borderRadius:'50%', background:col, boxShadow:`0 0 8px ${col}`, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ fontSize:14, fontWeight:700 }}>{result.label}</span>
            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, padding:'2px 8px', borderRadius:20, background:`${col}22`, border:`1px solid ${col}55`, color:col, textTransform:'uppercase' }}>{result.severity}</span>
          </div>
          <div style={{ fontSize:13, color:'rgba(255,245,240,0.6)', marginTop:4, lineHeight:1.5 }}>{result.summary}</div>
        </div>
        <span style={{ fontSize:11, color:'rgba(255,245,240,0.3)', flexShrink:0, fontFamily:'JetBrains Mono,monospace' }}>{open ? '▲' : '▼'}</span>
      </div>

      {/* Expanded details */}
      {open && result.details && (
        <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.06)', animation:'fadein .2s ease forwards' }}>
          {result.details.missing?.length > 0 && (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:1, color:'rgba(255,245,240,0.3)', textTransform:'uppercase', marginBottom:8 }}>Missing</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {result.details.missing.map(m => (
                  <span key={m} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, padding:'3px 10px', borderRadius:6, background:'rgba(255,59,31,0.1)', border:'1px solid rgba(255,59,31,0.25)', color:'#ff7a1f' }}>{m}</span>
                ))}
              </div>
            </div>
          )}
          {result.details.issues?.length > 0 && (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:1, color:'rgba(255,245,240,0.3)', textTransform:'uppercase', marginBottom:8 }}>Issues</div>
              {result.details.issues.map((iss, i) => (
                <div key={i} style={{ fontSize:12, color:'rgba(255,245,240,0.55)', fontFamily:'JetBrains Mono,monospace', marginBottom:4, paddingLeft:12, borderLeft:'2px solid rgba(255,59,31,0.4)' }}>
                  {iss}
                </div>
              ))}
            </div>
          )}
          {result.details.exposed && Object.keys(result.details.exposed).length > 0 && (
            <div>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:1, color:'rgba(255,245,240,0.3)', textTransform:'uppercase', marginBottom:8 }}>Exposed Info</div>
              {Object.entries(result.details.exposed).map(([k, v]) => (
                <div key={k} style={{ fontSize:12, fontFamily:'JetBrains Mono,monospace', color:'rgba(255,245,240,0.55)', marginBottom:4 }}>
                  <span style={{ color:'#ff7a1f' }}>{k}:</span> {v}
                </div>
              ))}
            </div>
          )}
          {result.details.cookies?.length > 0 && (
            <div>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:1, color:'rgba(255,245,240,0.3)', textTransform:'uppercase', marginBottom:8 }}>Cookies</div>
              {result.details.cookies.map((c, i) => (
                <div key={i} style={{ fontSize:12, fontFamily:'JetBrains Mono,monospace', color:'rgba(255,245,240,0.55)', marginBottom:6, display:'flex', gap:8, flexWrap:'wrap' }}>
                  <span style={{ color:'#ff7a1f' }}>{c.raw}</span>
                  <span style={{ color: c.httpOnly ? '#4ade80' : '#ff3b1f' }}>HttpOnly:{c.httpOnly?'✓':'✗'}</span>
                  <span style={{ color: c.secure   ? '#4ade80' : '#ff3b1f' }}>Secure:{c.secure?'✓':'✗'}</span>
                  {c.sameSite && <span style={{ color:'rgba(255,245,240,0.4)' }}>SameSite:{c.sameSite}</span>}
                </div>
              ))}
            </div>
          )}
          {result.details.note && (
            <div style={{ fontSize:12, fontFamily:'JetBrains Mono,monospace', color:'rgba(255,245,240,0.4)', fontStyle:'italic' }}>{result.details.note}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const url  = params.get('url')  || ''
  const mode = params.get('mode') || 'Full Scan'

  const [step, setStep]         = useState(0)
  const [data, setData]         = useState(null)
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [ringReady, setRingReady] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => s < STEPS.length - 1 ? s + 1 : s)
    }, 900)

    runScan(url, mode.toLowerCase().replace(' scan','').replace(' / ','').replace(' ',''))
      .then(res => {
        setData(res)
        setLoading(false)
        clearInterval(interval)
        setTimeout(() => setRingReady(true), 300)
      })
      .catch(err => { setError(err.message); setLoading(false); clearInterval(interval) })

    return () => clearInterval(interval)
  }, [url])

  const score   = calcScore(data?.results)
  const { color: scoreColor } = scoreLabel(score)
  const sorted  = [...(data?.results || [])].sort((a, b) => (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9))
  const critical = data?.results?.filter(r => r.severity === 'critical' || r.severity === 'high').length || 0

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth:900, margin:'0 auto', padding:'52px 48px' }}>

        {/* Back */}
        <button onClick={() => navigate('/')} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'rgba(255,245,240,0.32)', background:'none', border:'none', cursor:'pointer', marginBottom:32, display:'flex', alignItems:'center', gap:6 }}
          onMouseOver={e => e.currentTarget.style.color='#ff3b1f'}
          onMouseOut={e  => e.currentTarget.style.color='rgba(255,245,240,0.32)'}
        >← Back to scanner</button>

        {/* Title */}
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, letterSpacing:2, color:'#ff7a1f', marginBottom:12, textTransform:'uppercase' }}>
          {loading ? 'Scanning target...' : 'Scan complete'}
        </div>
        <h2 style={{ fontSize:28, fontWeight:800, letterSpacing:-1, marginBottom: loading ? 36 : 48 }}>
          {loading ? 'Analyzing ' : 'Security report — '}
          <span style={{ background:'linear-gradient(90deg,#ff3b1f,#ff7a1f)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{url}</span>
        </h2>

        {/* Loading steps */}
        {loading && (
          <div style={{ background:'rgba(20,8,4,0.65)', border:'1px solid rgba(255,59,31,0.18)', borderRadius:16, padding:32, backdropFilter:'blur(20px)', marginBottom:40 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 0', borderBottom: i < STEPS.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', opacity: i <= step ? 1 : 0.2, transition:'opacity .4s' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11,
                  background: i < step  ? 'rgba(255,59,31,0.15)' : i === step ? 'linear-gradient(135deg,#ff3b1f,#ff7a1f)' : 'rgba(255,255,255,0.05)',
                  border:     i < step  ? '1px solid rgba(255,59,31,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  color:      i < step  ? '#ff3b1f' : '#0e0704'
                }}>
                  {i < step ? '✓' : i === step ? '…' : ''}
                </div>
                <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:13, color: i <= step ? '#fff5f0' : 'rgba(255,245,240,0.3)' }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background:'rgba(255,59,31,0.08)', border:'1px solid rgba(255,59,31,0.3)', borderRadius:16, padding:24, color:'#ff3b1f', fontFamily:'JetBrains Mono,monospace', fontSize:13 }}>
            ⚠ {error} — make sure the backend is running on port 3001.
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div style={{ animation:'fadein .5s ease forwards' }}>

            {/* Score + summary row */}
            <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:20, marginBottom:36 }}>

              {/* Score ring card */}
              <div style={{ background:'rgba(20,8,4,0.65)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:'28px 20px', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                <ScoreRing score={score} animated={ringReady} />
              </div>

              {/* Summary card */}
              <div style={{ background:'rgba(20,8,4,0.65)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:'28px 28px', backdropFilter:'blur(20px)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:'8%', right:'8%', height:1, background:`linear-gradient(90deg,transparent,${scoreColor}55,transparent)` }} />

                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:2, color:'rgba(255,245,240,0.3)', textTransform:'uppercase', marginBottom:12 }}>Risk Summary</div>

                <div style={{ fontSize:15, color:'rgba(255,245,240,0.75)', lineHeight:1.7, marginBottom:20 }}>
                  {critical > 0
                    ? <><span style={{ color:'#ff3b1f', fontWeight:700 }}>{critical} critical/high</span> issue{critical > 1 ? 's' : ''} found that need immediate attention.</>
                    : <><span style={{ color:'#4ade80', fontWeight:700 }}>No critical issues</span> detected. Review medium/low findings below.</>
                  }
                </div>

                {/* Mini severity breakdown */}
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {['critical','high','medium','low','pass'].map(sev => {
                    const count = data.results.filter(r => r.severity === sev).length
                    if (count === 0) return null
                    const col = SEV_COLOR[sev]
                    return (
                      <div key={sev} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'JetBrains Mono,monospace', fontSize:11, padding:'4px 12px', borderRadius:20, background:`${col}14`, border:`1px solid ${col}44`, color:col }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:col, display:'inline-block' }} />
                        {count} {sev}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Module cards */}
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:2, color:'rgba(255,245,240,0.3)', textTransform:'uppercase', marginBottom:14 }}>
              Module Results — click to expand
            </div>
            {sorted.map((r, i) => <ModuleCard key={i} result={r} />)}

            {/* AI Report */}
            {data.aiReport && !data.aiReport.skipped && (
              <div style={{ background:'rgba(20,8,4,0.65)', border:'1px solid rgba(255,59,31,0.25)', borderRadius:16, padding:32, backdropFilter:'blur(20px)', marginTop:28, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:'8%', right:'8%', height:1, background:'linear-gradient(90deg,transparent,rgba(255,59,31,0.5),transparent)' }} />
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, letterSpacing:2, color:'#ff7a1f', textTransform:'uppercase', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                  🤖 AI Analysis — Claude
                </div>
                <pre style={{ fontSize:13, color:'rgba(255,245,240,0.65)', lineHeight:1.85, whiteSpace:'pre-wrap', fontFamily:'JetBrains Mono,monospace' }}>
                  {data.aiReport.report}
                </pre>
              </div>
            )}

            {data.aiReport?.skipped && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:20, fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'rgba(255,245,240,0.3)', marginTop:20 }}>
                🤖 {data.aiReport.note || 'AI analysis skipped — add ANTHROPIC_API_KEY to .env'}
              </div>
            )}

            {/* Re-scan */}
            <div style={{ display:'flex', justifyContent:'center', marginTop:40 }}>
              <button onClick={() => navigate('/')} style={{ background:'linear-gradient(135deg,#ff3b1f,#ff7a1f)', color:'#0e0704', border:'none', borderRadius:11, padding:'13px 32px', fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 24px rgba(255,59,31,0.35)', transition:'transform .15s' }}
                onMouseOver={e => e.currentTarget.style.transform='translateY(-1px)'}
                onMouseOut={e  => e.currentTarget.style.transform='translateY(0)'}
              >
                Scan another site →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}