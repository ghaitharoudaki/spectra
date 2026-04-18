export function validateUrl(req, res, next) {
  const url = req.body?.url || req.query?.url

  if (!url) {
    return res.status(400).json({ ok: false, error: 'URL is required' })
  }

  // Strip protocol if present
  const cleaned = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  // Basic domain check
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(\/.*)?$/
  if (!domainRegex.test(cleaned)) {
    return res.status(400).json({ ok: false, error: 'Invalid domain format' })
  }

  // Attach cleaned version
  req.targetUrl = cleaned
  next()
}