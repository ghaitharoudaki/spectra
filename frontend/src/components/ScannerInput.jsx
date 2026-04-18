import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MODES = ['Full Scan', 'SSL / TLS', 'DNS Audit', 'Malware', 'AI Deep Dive']

export default function ScannerInput() {
  const [url, setUrl]           = useState('')
  const [mode, setMode]         = useState('Full Scan')
  const [scanning, setScanning] = useState(false)
  const navigate = useNavigate()

  const startScan = () => {
    const target = url.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    if (!target) return
    setScanning(true)
    navigate(`/results?url=${encodeURIComponent(target)}&mode=${encodeURIComponent(mode)}`)
  }

  return (
    <div style={{ background:'rgba(20,8,4,0.65)', border:'1px solid rgba(255,59,31,0.2)', borderRadius:20, padding:24, backdropFilter:'blur(24px)', boxShadow:'0 0 60px rgba(255,59,31,0.06), inset 0 1px 0 rgba(255,255,255,0.04)', position:'relative', overflow:'hidden' }}>

      <div style={{ position:'absolute', top:0, left:'8%', right:'8%', height:1, background:'linear-gradient(90deg,transparent,rgba(255,59,31,0.5),transparent)' }} />

      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:2, color:'rgba(255,245,240,0.32)', textTransform:'uppercase', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ width:16, height:1, background:'rgba(255,59,31,0.5)', display:'block' }} />
        Target URL
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <div style={{ flex:1, position:'relative' }}>
          <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'#ff3b1f', opacity:0.8, pointerEvents:'none' }}>
            https://
          </span>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && startScan()}
            placeholder="yourwebsite.com"
            autoComplete="off"
            spellCheck="false"
            style={{ width:'100%', background:'rgba(12,4,2,0.8)', border:'1px solid rgba(255,59,31,0.18)', borderRadius:11, padding:'13px 14px 13px 70px', fontFamily:'JetBrains Mono,monospace', fontSize:13, color:'#fff5f0', outline:'none', caretColor:'#ff3b1f', transition:'border-color .2s, box-shadow .2s' }}
            onFocus={e => { e.target.style.borderColor='rgba(255,59,31,0.5)'; e.target.style.boxShadow='0 0 0 3px rgba(255,59,31,0.08)' }}
            onBlur={e  => { e.target.style.borderColor='rgba(255,59,31,0.18)'; e.target.style.boxShadow='none' }}
          />
        </div>

        <button onClick={startScan} disabled={scanning} style={{ background:'linear-gradient(135deg,#ff3b1f,#ff7a1f)', color:'#0e0704', border:'none', borderRadius:11, padding:'13px 26px', fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', transition:'transform .15s, box-shadow .2s', boxShadow:'0 4px 24px rgba(255,59,31,0.35)' }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={e  => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {scanning ? 'Starting...' : 'Scan Now →'}
        </button>
      </div>

      <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
        {MODES.map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10.5, padding:'5px 13px', borderRadius:20, cursor:'pointer', background: mode===m ? 'rgba(255,59,31,0.12)' : 'rgba(12,4,2,0.7)', border: mode===m ? '1px solid rgba(255,59,31,0.45)' : '1px solid rgba(255,255,255,0.08)', color: mode===m ? '#ff3b1f' : 'rgba(255,245,240,0.32)', transition:'all .2s' }}>
            <span style={{ display:'inline-block', width:5, height:5, borderRadius:'50%', background:'currentColor', marginRight:5, verticalAlign:'middle' }} />
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}