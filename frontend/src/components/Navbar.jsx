import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(255,59,31,0.1)', backdropFilter:'blur(14px)', background:'rgba(14,7,4,0.6)', position:'sticky', top:0, zIndex:100 }}>

      <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', color:'#fff5f0' }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#ff3b1f,#ff7a1f)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, boxShadow:'0 0 22px rgba(255,59,31,0.4)' }}>🛡</div>
        <span style={{ fontSize:20, fontWeight:800, letterSpacing:-0.5 }}>
          Spectra<span style={{ color:'#ff3b1f', fontWeight:300 }}></span>
        </span>
      </Link>

      <div style={{ display:'flex', gap:32 }}>
        {['Features', 'How it works', 'API'].map(l => (
          <a key={l} href="#" style={{ fontSize:13.5, fontWeight:500, color:'rgba(255,245,240,0.6)', textDecoration:'none', transition:'color .2s' }}
            onMouseOver={e => e.target.style.color = '#ff3b1f'}
            onMouseOut={e  => e.target.style.color = 'rgba(255,245,240,0.6)'}
          >{l}</a>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:1, padding:'4px 10px', borderRadius:20, background:'rgba(255,59,31,0.08)', border:'1px solid rgba(255,59,31,0.25)', color:'#ff3b1f' }}>
          BETA · PHASE 1
        </span>
      </div>
    </nav>
  )
}