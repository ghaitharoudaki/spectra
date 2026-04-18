import { Router } from 'express'
import { runFullScan } from '../services/scanner.js'
import { runAIAnalysis } from '../services/aiAnalysis.js'
import { validateUrl } from '../middleware/validateUrl.js'

const router = Router()

router.post('/', validateUrl, async (req, res) => {
  const { mode = 'full' } = req.body
  const url = req.targetUrl

  try {
    const results  = await runFullScan(url, mode)
    const aiReport = await runAIAnalysis(url, results)
    res.json({ ok: true, url, mode, results, aiReport })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: err.message })
  }
})

router.get('/health', (_, res) => {
  res.json({ ok: true, name: 'Spectra', version: '1.0.0' })
})

export default router