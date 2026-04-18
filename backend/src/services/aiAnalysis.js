import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function runAIAnalysis(url, scanResults) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_key_here') {
    return {
      skipped: true,
      note: 'Add ANTHROPIC_API_KEY to .env to enable AI analysis'
    }
  }

  const resultsText = scanResults.map(r =>
    `[${r.label}] Severity: ${r.severity} — ${r.summary}\nDetails: ${JSON.stringify(r.details, null, 2)}`
  ).join('\n\n')

  const prompt = `You are Spectra, an expert web security analyst AI. You have just completed a passive security scan of the website: ${url}

Here are the raw scan results:

${resultsText}

Write a security report with these exact sections:

1. OVERALL RISK SCORE: Give a score from 0-100 (100 = perfectly secure) and one sentence verdict.

2. CRITICAL FINDINGS: List only severity: critical or high issues. For each: what it is, why it matters, exact fix.

3. MEDIUM FINDINGS: List medium severity issues with fixes.

4. QUICK WINS: 3 things they can fix in under 10 minutes.

5. STACK-SPECIFIC ADVICE: Based on any tech you detected, give tailored advice.

Be direct. No fluff. Use plain English — the user might not be a security expert. Format fixes as actionable steps.`

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      skipped: false,
      report: message.content[0].text,
      tokensUsed: message.usage?.input_tokens + message.usage?.output_tokens
    }
  } catch (err) {
    return {
      skipped: true,
      error: err.message,
      note: 'AI analysis failed — check your ANTHROPIC_API_KEY'
    }
  }
}