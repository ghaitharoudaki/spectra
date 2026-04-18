import axios from 'axios'
import dns from 'dns'
import { promisify } from 'util'

const resolveTxt    = promisify(dns.resolveTxt)
const resolveMx     = promisify(dns.resolveMx)
const resolveNs     = promisify(dns.resolveNs)
const resolve4      = promisify(dns.resolve4)

// ── Helpers ──────────────────────────────────────────
function severity(level) {
  // 'critical' | 'high' | 'medium' | 'low' | 'pass'
  return level
}

async function fetchHeaders(url) {
  try {
    const res = await axios.get(`https://${url}`, {
      timeout: 8000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: { 'User-Agent': 'Spectra-Security-Scanner/1.0' }
    })
    return { headers: res.headers, status: res.status, ok: true }
  } catch (err) {
    return { headers: {}, status: null, ok: false, error: err.message }
  }
}

// ── Module 1: SSL Check (via SSL Labs API) ─────────────
async function checkSSL(url) {
  const domain = url.split('/')[0]
  try {
    // Kick off analysis
    await axios.get(`https://api.ssllabs.com/api/v3/analyze?host=${domain}&startNew=on&all=done`, { timeout: 10000 })
    // Return pending — full result takes time, we note it
    return {
      module: 'ssl',
      label: 'SSL / TLS',
      status: 'pending',
      severity: severity('medium'),
      summary: 'SSL analysis kicked off — full grade takes ~60s',
      details: { domain, note: 'Use /api/scan/ssl-grade?url=... to poll result' }
    }
  } catch {
    // Fallback: just check if HTTPS works
    try {
      const res = await axios.head(`https://${domain}`, { timeout: 6000 })
      return {
        module: 'ssl',
        label: 'SSL / TLS',
        status: 'done',
        severity: severity('pass'),
        summary: 'HTTPS is reachable and responding',
        details: { status: res.status, httpsWorks: true }
      }
    } catch {
      return {
        module: 'ssl',
        label: 'SSL / TLS',
        status: 'done',
        severity: severity('critical'),
        summary: 'HTTPS is not reachable — site may be HTTP only',
        details: { httpsWorks: false }
      }
    }
  }
}

// ── Module 2: HTTP Security Headers ───────────────────
async function checkHeaders(url) {
  const { headers, ok, error } = await fetchHeaders(url)

  if (!ok) {
    return {
      module: 'headers',
      label: 'Security Headers',
      status: 'done',
      severity: severity('high'),
      summary: 'Could not reach the site to check headers',
      details: { error }
    }
  }

  const checks = {
    'content-security-policy':     { present: false, severity: 'high',   label: 'Content-Security-Policy' },
    'x-frame-options':             { present: false, severity: 'medium', label: 'X-Frame-Options' },
    'x-content-type-options':      { present: false, severity: 'medium', label: 'X-Content-Type-Options' },
    'strict-transport-security':   { present: false, severity: 'high',   label: 'HSTS' },
    'referrer-policy':             { present: false, severity: 'low',    label: 'Referrer-Policy' },
    'permissions-policy':          { present: false, severity: 'low',    label: 'Permissions-Policy' },
  }

  let missing = []
  for (const [key, val] of Object.entries(checks)) {
    if (headers[key]) {
      val.present = true
      val.value   = headers[key]
    } else {
      missing.push(val.label)
    }
  }

  const criticalMissing = Object.values(checks).filter(c => !c.present && c.severity === 'high')
  const overallSeverity = criticalMissing.length >= 2 ? 'critical'
                        : criticalMissing.length === 1 ? 'high'
                        : missing.length > 2 ? 'medium'
                        : missing.length > 0 ? 'low'
                        : 'pass'

  return {
    module: 'headers',
    label: 'Security Headers',
    status: 'done',
    severity: severity(overallSeverity),
    summary: missing.length === 0
      ? 'All critical security headers are present'
      : `Missing ${missing.length} security header(s): ${missing.slice(0,3).join(', ')}`,
    details: { checks, missing }
  }
}

// ── Module 3: DNS & Email Security ────────────────────
async function checkDNS(url) {
  const domain = url.split('/')[0]
  const results = { spf: null, dmarc: null, dkim: null, mx: null, ns: null, ipv4: null }
  const issues  = []

  try { results.ipv4 = await resolve4(domain) } catch { issues.push('No A record found') }
  try { results.mx   = await resolveMx(domain) } catch { issues.push('No MX records — email may not work') }
  try { results.ns   = await resolveNs(domain) } catch { }

  // SPF
  try {
    const txt = await resolveTxt(domain)
    const spf = txt.flat().find(r => r.startsWith('v=spf1'))
    if (spf) results.spf = spf
    else issues.push('Missing SPF record — domain vulnerable to email spoofing')
  } catch { issues.push('Could not resolve TXT records for SPF') }

  // DMARC
  try {
    const txt = await resolveTxt(`_dmarc.${domain}`)
    const dmarc = txt.flat().find(r => r.startsWith('v=DMARC1'))
    if (dmarc) results.dmarc = dmarc
    else issues.push('Missing DMARC record')
  } catch { issues.push('Missing DMARC record — no email authentication policy') }

  const overallSeverity = issues.length >= 3 ? 'high'
                        : issues.length === 2 ? 'medium'
                        : issues.length === 1 ? 'low'
                        : 'pass'

  return {
    module: 'dns',
    label: 'DNS & Email Security',
    status: 'done',
    severity: severity(overallSeverity),
    summary: issues.length === 0
      ? 'SPF, DMARC configured correctly'
      : `Found ${issues.length} DNS issue(s): ${issues[0]}`,
    details: { results, issues }
  }
}

// ── Module 4: Malware / Reputation (VirusTotal) ────────
async function checkReputation(url) {
  const domain = url.split('/')[0]
  const apiKey = process.env.VIRUSTOTAL_API_KEY

  if (!apiKey || apiKey === 'your_key_here') {
    return {
      module: 'reputation',
      label: 'Malware & Reputation',
      status: 'skipped',
      severity: severity('low'),
      summary: 'VirusTotal API key not configured',
      details: { note: 'Add VIRUSTOTAL_API_KEY to .env to enable this module' }
    }
  }

  try {
    const encoded = Buffer.from(domain).toString('base64').replace(/=/g, '')
    const res = await axios.get(`https://www.virustotal.com/api/v3/domains/${domain}`, {
      headers: { 'x-apikey': apiKey },
      timeout: 8000
    })

    const stats     = res.data?.data?.attributes?.last_analysis_stats || {}
    const malicious = stats.malicious || 0
    const suspicious= stats.suspicious || 0
    const total     = Object.values(stats).reduce((a, b) => a + b, 0)

    const overallSeverity = malicious > 3  ? 'critical'
                          : malicious > 0  ? 'high'
                          : suspicious > 0 ? 'medium'
                          : 'pass'

    return {
      module: 'reputation',
      label: 'Malware & Reputation',
      status: 'done',
      severity: severity(overallSeverity),
      summary: malicious > 0
        ? `Flagged as malicious by ${malicious}/${total} engines`
        : `Clean — 0 malicious detections across ${total} engines`,
      details: { stats, malicious, suspicious, total }
    }
  } catch (err) {
    return {
      module: 'reputation',
      label: 'Malware & Reputation',
      status: 'error',
      severity: severity('low'),
      summary: 'Could not fetch VirusTotal data',
      details: { error: err.message }
    }
  }
}

// ── Module 5: Cookie Audit ─────────────────────────────
async function checkCookies(url) {
  try {
    const res = await axios.get(`https://${url}`, {
      timeout: 8000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: { 'User-Agent': 'Spectra-Security-Scanner/1.0' }
    })

    const setCookie = res.headers['set-cookie'] || []
    if (setCookie.length === 0) {
      return {
        module: 'cookies',
        label: 'Cookie Audit',
        status: 'done',
        severity: severity('pass'),
        summary: 'No cookies set on initial load',
        details: { cookies: [] }
      }
    }

    const parsed = setCookie.map(c => {
      const parts = c.split(';').map(p => p.trim().toLowerCase())
      return {
        raw:       c.split(';')[0].split('=')[0].trim(),
        httpOnly:  parts.includes('httponly'),
        secure:    parts.includes('secure'),
        sameSite:  parts.find(p => p.startsWith('samesite'))?.split('=')[1] || null,
      }
    })

    const issues = parsed.filter(c => !c.httpOnly || !c.secure)
    const overallSeverity = issues.length > 2 ? 'high'
                          : issues.length > 0 ? 'medium'
                          : 'pass'

    return {
      module: 'cookies',
      label: 'Cookie Audit',
      status: 'done',
      severity: severity(overallSeverity),
      summary: issues.length === 0
        ? `All ${parsed.length} cookie(s) have HttpOnly and Secure flags`
        : `${issues.length}/${parsed.length} cookie(s) missing security flags`,
      details: { cookies: parsed, issues: issues.map(c => c.raw) }
    }
  } catch (err) {
    return {
      module: 'cookies',
      label: 'Cookie Audit',
      status: 'error',
      severity: severity('low'),
      summary: 'Could not fetch cookies',
      details: { error: err.message }
    }
  }
}

// ── Module 6: Tech Fingerprint ─────────────────────────
async function checkTechFingerprint(url) {
  const { headers, ok } = await fetchHeaders(url)
  if (!ok) return {
    module: 'fingerprint',
    label: 'Tech Fingerprinting',
    status: 'error',
    severity: severity('low'),
    summary: 'Could not reach site for fingerprinting',
    details: {}
  }

  const exposed  = {}
  const risky    = []

  if (headers['server'])         { exposed.server  = headers['server'] }
  if (headers['x-powered-by'])   { exposed.poweredBy = headers['x-powered-by']; risky.push(`X-Powered-By: ${headers['x-powered-by']}`) }
  if (headers['x-aspnet-version']) { exposed.aspnet = headers['x-aspnet-version']; risky.push(`ASP.NET version exposed`) }
  if (headers['x-generator'])    { exposed.generator = headers['x-generator'] }

  const overallSeverity = risky.length >= 2 ? 'high'
                        : risky.length === 1 ? 'medium'
                        : Object.keys(exposed).length > 0 ? 'low'
                        : 'pass'

  return {
    module: 'fingerprint',
    label: 'Tech Fingerprinting',
    status: 'done',
    severity: severity(overallSeverity),
    summary: risky.length > 0
      ? `${risky.length} sensitive header(s) exposing server info`
      : Object.keys(exposed).length > 0
      ? `Server header present: ${exposed.server || 'unknown'}`
      : 'No sensitive tech info exposed in headers',
    details: { exposed, risky }
  }
}

// ── Main orchestrator ──────────────────────────────────
export async function runFullScan(url, mode = 'full') {
  const modules = mode === 'full'
    ? [checkSSL, checkHeaders, checkDNS, checkReputation, checkCookies, checkTechFingerprint]
    : mode === 'ssl'      ? [checkSSL]
    : mode === 'dns'      ? [checkDNS]
    : mode === 'malware'  ? [checkReputation]
    : [checkSSL, checkHeaders, checkDNS, checkReputation, checkCookies, checkTechFingerprint]

  const results = await Promise.allSettled(modules.map(fn => fn(url)))

  return results.map(r =>
    r.status === 'fulfilled'
      ? r.value
      : { module: 'unknown', label: 'Unknown', status: 'error', severity: 'low', summary: r.reason?.message || 'Module failed', details: {} }
  )
}