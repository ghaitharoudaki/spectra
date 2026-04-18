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

const severityColor = {
  critical: '#ff3b1f',
  high:     '#ff7a1f',
  medium:   '#ffaa44',
  low:      'rgba(255,245,240,0.5)',
  pass:     '#4ade80',
  skipped:  'rgba(255,245,240,0.25)',
  error:    '#ff3b1f',
}

export default function ResultsPage() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const url  = params.get('url')  || ''
  const mode = params.get('mode') || 'Full Scan'

  const [step, setStep]       = useState(0)
  const [data, setData]       = useState(null)
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => s < STEPS.length - 1 ? s + 1 : s)
    }, 900)

    runScan(url, mode.toLowerCase().replace(' scan','').replace(' / ','').replace(' ',''))
      .then(res => { setData(res); setLoading(false); clearInterval(interval) })
      .catch(err => { setError(err.message); setLoading(false); clearInterval(interval) })

    return () => clearInterval(interval)
  }, [url])

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth:860, margin:'0 auto', padding:'60px 48px' }}>

        <button onClick={() => navigate('/')} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'rgba(255,245,240,0.32)', background:'none', border:'none', cursor:'pointer', marginBottom:32, display:'flex', alignItems:'center', gap:6 }}
          onMouseOver={e => e.currentTarget.style.color='#ff3b1f'}
          onMouseOut={e  => e.currentTarget.style.color='rgba(255,245,240,0.32)'}
        >← Back</button>

        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, letterSpacing:2, color:'#ff7a1f', marginBottom:16, textTransform:'uppercase' }}>
          {loading ? 'Scanning...' : 'Scan Complete'}
        </div>

        <h2 style={{ fontSize:32, fontWeight:800, letterSpacing:-1.5, marginBottom:32 }}>
          {loading ? 'Scanning ' : 'Results for '}
          <span style={{ background:'linear-gradient(90deg,#ff3b1f,#ff7a1f)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{url}</span>
        </h2>

        {loading && (
          <div style={{ background:'rgba(20,8,4,0.65)', border:'1px solid rgba(255,59,31,0.18)', borderRadius:16, padding:32, backdropFilter:'blur(20px)', marginBottom:40 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 0', borderBottom: i < STEPS.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', opacity: i <= step ? 1 : 0.2, transition:'opacity .4s' }}>
                <div style={{ width:20, height:20, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11,
                  background: i < step  ? 'rgba(255,59,31,0.15)' : i === step ? 'linear-gradient(135deg,#ff3b1f,#ff7a1f)' : 'rgba(255,255,255,0.05)',
                  border:     i < step  ? '1px solid rgba(255,59,31,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  color:      i < step  ? '#ff3b1f' : '#0e0704'
                }}>
                  {i < step ? '✓' : i === step ? '…' : ''}
                </div>
                <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:13, color: i <= step ? '#fff5f0' : 'rgba(255,245,240,0.35)' }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ background:'rgba(255,59,31,0.08)', border:'1px solid rgba(255,59,31,0.3)', borderRadius:16, padding:24, color:'#ff3b1f', fontFamily:'JetBrains Mono,monospace', fontSize:13 }}>
            ⚠ {error}
          </div>
        )}

        {data && (
          <div style={{ animation:'fadein .5s ease forwards' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:40 }}>
              {data.results?.map((r, i) => {
                const col = severityColor[r.severity] || 'rgba(255,245,240,0.35)'
                return (
                  <div key={i} style={{ background:'rgba(20,8,4,0.65)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 22px', backdropFilter:'blur(16px)', display:'flex', alignItems:'flex-start', gap:16, transition:'border-color .2s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor='rgba(255,59,31,0.2)'}
                    onMouseOut={e  => e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'}
                  >
                    <div style={{ width:10, height:10, borderRadius:'50%', background:col, boxShadow:`0 0 8px ${col}`, flexShrink:0, marginTop:5 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:14, fontWeight:700 }}>{r.label}</span>
                        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, padding:'2px 8px', borderRadius:20, background:`${col}22`, border:`1px solid ${col}55`, color:col, textTransform:'uppercase' }}>{r.severity}</span>
                      </div>
                      <div style={{ fontSize:13, color:'rgba(255,245,240,0.6)', lineHeight:1.6 }}>{r.summary}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {data.aiReport && !data.aiReport.skipped && (
              <div style={{ background:'rgba(20,8,4,0.65)', border:'1px solid rgba(255,59,31,0.25)', borderRadius:16, padding:32, backdropFilter:'blur(20px)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:'8%', right:'8%', height:1, background:'linear-gradient(90deg,transparent,rgba(255,59,31,0.5),transparent)' }} />
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, letterSpacing:2, color:'#ff7a1f', textTransform:'uppercase', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                  🤖 AI Analysis — Claude
                </div>
                <pre style={{ fontSize:13, color:'rgba(255,245,240,0.65)', lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'JetBrains Mono,monospace' }}>
                  {data.aiReport.report}
                </pre>
              </div>
            )}

            {data.aiReport?.skipped && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:20, fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'rgba(255,245,240,0.35)' }}>
                🤖 {data.aiReport.note || 'AI analysis skipped'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}