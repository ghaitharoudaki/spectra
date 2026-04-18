import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import scanRouter from './routes/scan.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/scan', scanRouter)

app.get('/api/health', (_, res) => {
  res.json({ ok: true, version: '1.0.0', name: 'Spectra' })
})

app.listen(PORT, () => {
  console.log(`✅  Spectra API running on http://localhost:${PORT}`)
})