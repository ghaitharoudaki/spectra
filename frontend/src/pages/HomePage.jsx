import Navbar from '../components/Navbar.jsx'
import ScannerInput from '../components/ScannerInput.jsx'

const PHASES = [
  { n:1, name:'Landing & Scanner UI',    status:'wip',  badge:'IN PROGRESS', desc:'Glass UI, scan input, mode selector, animations',         tags:['glass-ui','scanner','animations'] },
  { n:2, name:'Scan Results Dashboard',  status:'next', badge:'NEXT',         desc:'Security score ring, per-module findings, severity cards', tags:['score-ring','module-cards','severity'] },
  { n:3, name:'AI Analysis Panel',       status:'todo', badge:'PLANNED',      desc:'Claude synthesizes all signals into plain-English report', tags:['claude-api','risk-summary','fix-advice'] },
  { n:4, name:'Live API Integrations',   status:'todo', badge:'PLANNED',      desc:'SSL Labs, VirusTotal, DNS lookup, WHOIS, fingerprinting',  tags:['ssl-labs','virustotal','dns','whois'] },
  { n:5, name:'PDF Report Export',       status:'todo', badge:'PLANNED',      desc:'Branded security report download for clients and teams',   tags:['pdf-export','branding','history'] },
]

const MODULES = [
  { icon:'🔐', name:'SSL / TLS Analysis',     desc:'Certificate expiry, cipher strength, HSTS, protocol checks',   tag:'Passive',  color:'red' },
  { icon:'🤖', name:'AI Threat Analysis',     desc:'Claude synthesizes every module into plain-English findings',  tag:'AI Layer', color:'orange' },
  { icon:'🦠', name:'Malware & Reputation',   desc:'VirusTotal cross-reference, blocklist status, phishing flags', tag:'Live',     color:'red' },
  { icon:'📡', name:'DNS & Email Security',   desc:'SPF, DMARC, DKIM — prevent email spoofing attacks',           tag:'DNS',      color:'orange' },
  { icon:'🔭', name:'Tech Fingerprinting',    desc:'Detect outdated CMS, exposed framework versions',             tag:'Recon',    color:'amber' },
  { icon:'🍪', name:'Cookie & Session Audit', desc:'HttpOnly, Secure, SameSite flags — session hijacking risk',   tag:'Session',  color:'red' },
  { icon:'🚪', name:'Open Port Exposure',     desc:'Detect exposed admin panels, databases, dev services',        tag:'Network',  color:'orange' },
  { icon:'🌐', name:'WHOIS & Domain Intel',   desc:'Registrar data, expiry risk, domain privacy leaks',           tag:'OSINT',    color:'amber' },
  { icon:'📋', name:'AI Fix Report',          desc:'Prioritized action plan with stack-specific code fixes',      tag:'AI Layer', color:'orange' },
]

const tagColors = {
  red:    { bg:'rgba(255,59,31,0.1)',   border:'rgba(255,59,31,0.28)',   text:'#ff3b1f' },
  orange: { bg:'rgba(255,122,31,0.1)',  border:'rgba(255,122,31,0.28)',  text:'#ff7a1f' },
  amber:  { bg:'rgba(255,170,68,0.1)',  border:'rgba(255,170,68,0.28)',  text:'#ffaa44' },
}

export default function HomePage() {
  return (
    <div>
      <Navbar />

      <section style={{ maxWidth:1100, margin:'0 auto', padding:'88px 48px 60px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>

        <div style={{ animation:'fadein .6s ease forwards' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:'JetBrains Mono,monospace', fontSize:11, letterSpacing:2, color:'#ff7a1f', border:'1px solid rgba(255,122,31,0.25)', background:'rgba(255,122,31,0.07)', borderRadius:20, padding:'5px 14px', marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#ff7a1f', boxShadow:'0 0 8px #ff7a1f', display:'inline-block', animation:'blink 2s ease-in-out infinite' }} />
            AI-Powered Security Intelligence
          </div>

          <h1 style={{ fontSize:'clamp(36px,5vw,58px)', fontWeight:800, lineHeight:1.06, letterSpacing:-2, marginBottom:22 }}>
            Know if your site<br />
            <span style={{ background:'linear-gradient(90deg,#ff3b1f,#ff7a1f,#ffaa44)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              is actually safe
            </span><br />
            <span style={{ color:'rgba(255,245,240,0.5)', fontWeight:300 }}>before hackers do.</span>
          </h1>

          <p style={{ fontSize:16, lineHeight:1.75, color:'rgba(255,245,240,0.6)', maxWidth:440, marginBottom:36 }}>
            Drop any URL. Spectra runs 10+ passive security checks — SSL, DNS, malware, cookies, tech stack — then Claude AI writes a plain-English threat report with a tailored fix plan.
          </p>

          <ScannerInput />
        </div>

        {/* Roadmap card */}
        <div style={{ background:'rgba(20,8,4,0.65)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, backdropFilter:'blur(24px)', overflow:'hidden', boxShadow:'0 20px 80px rgba(0,0,0,0.5)', animation:'fadein .6s ease .2s both' }}>
          <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, letterSpacing:2, color:'rgba(255,245,240,0.32)', textTransform:'uppercase' }}>Build Roadmap</span>
            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, color:'#ff3b1f', background:'rgba(255,59,31,0.08)', border:'1px solid rgba(255,59,31,0.2)', borderRadius:20, padding:'3px 10px' }}>● In Progress</span>
          </div>

          {PHASES.map((p, i) => (
            <div key={p.n} style={{ display:'flex', gap:16, alignItems:'flex-start', padding:'15px 24px', borderBottom: i < PHASES.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: p.status==='wip' ? 'rgba(255,59,31,0.04)' : 'transparent', position:'relative' }}>
              {p.status === 'wip' && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2, background:'#ff3b1f' }} />}

              <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'JetBrains Mono,monospace', fontSize:12, fontWeight:700,
                ...(p.status === 'wip'
                  ? { background:'linear-gradient(135deg,#ff3b1f,#ff7a1f)', color:'#0e0704', boxShadow:'0 0 16px rgba(255,59,31,0.5)', animation:'pulse-ring 2.2s ease-in-out infinite' }
                  : { background:'rgba(255,255,255,0.05)', color:'rgba(255,245,240,0.32)', border:'1px solid rgba(255,255,255,0.1)' })
              }}>{p.n}</div>

              <div style={{ flex:1 }}>
                <div style={{ fontSize:13.5, fontWeight:600, marginBottom:3, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  {p.name}
                  <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:9, padding:'2px 7px', borderRadius:20,
                    ...(p.status==='wip'  ? { background:'rgba(255,59,31,0.15)',  color:'#ff7a1f',                  border:'1px solid rgba(255,122,31,0.3)' }
                      : p.status==='next' ? { background:'rgba(255,59,31,0.08)',  color:'#ff3b1f',                  border:'1px solid rgba(255,59,31,0.2)' }
                      :                    { background:'rgba(255,255,255,0.04)', color:'rgba(255,245,240,0.32)',   border:'1px solid rgba(255,255,255,0.08)' })
                  }}>{p.badge}</span>
                </div>
                <div style={{ fontSize:12, color:'rgba(255,245,240,0.32)', lineHeight:1.5, marginBottom:8 }}>{p.desc}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, padding:'2px 8px', borderRadius:5, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,245,240,0.32)' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth:1100, margin:'0 auto', borderTop:'1px solid rgba(255,255,255,0.05)' }} />

      <section style={{ maxWidth:1100, margin:'0 auto', padding:'70px 48px 80px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:3, color:'#ff7a1f', textTransform:'uppercase', display:'block', marginBottom:14 }}>What we scan</span>
          <h2 style={{ fontSize:'clamp(26px,4vw,38px)', fontWeight:700, letterSpacing:-1, marginBottom:14 }}>10 security modules.<br />One AI report.</h2>
          <p style={{ fontSize:15, color:'rgba(255,245,240,0.6)', maxWidth:500, margin:'0 auto' }}>Every check runs passively — no intrusive probing, no legal grey areas.</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {MODULES.map(m => {
            const tc = tagColors[m.color]
            return (
              <div key={m.name} style={{ background:'rgba(20,8,4,0.65)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'22px 20px 18px', cursor:'pointer', backdropFilter:'blur(16px)', position:'relative', overflow:'hidden', transition:'all .25s' }}
                onMouseOver={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(255,59,31,0.25)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.4)' }}
                onMouseOut={e  => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow='none' }}
              >
                <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent)' }} />
                <span style={{ fontSize:24, display:'block', marginBottom:12 }}>{m.icon}</span>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>{m.name}</div>
                <div style={{ fontSize:12, color:'rgba(255,245,240,0.35)', lineHeight:1.6, fontFamily:'JetBrains Mono,monospace' }}>{m.desc}</div>
                <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontFamily:'JetBrains Mono,monospace', fontSize:10, padding:'3px 9px', borderRadius:20, marginTop:12, background:tc.bg, border:`1px solid ${tc.border}`, color:tc.text }}>✦ {m.tag}</span>
              </div>
            )
          })}
        </div>

        <div style={{ display:'flex', gap:14, marginTop:50 }}>
          {[['10+','Scan modules'], ['~30s','Full scan time'], ['100%','Passive only'], ['0','False positives'], ['AI','Claude-powered']].map(([v, l]) => (
            <div key={l} style={{ flex:1, background:'rgba(20,8,4,0.65)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'20px 16px', backdropFilter:'blur(14px)', textAlign:'center', transition:'border-color .2s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,59,31,0.25)'}
              onMouseOut={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <div style={{ fontSize:30, fontWeight:800, letterSpacing:-1.5, lineHeight:1, background:'linear-gradient(135deg,#ff3b1f,#ff7a1f)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:6 }}>{v}</div>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, color:'rgba(255,245,240,0.32)', letterSpacing:1 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}