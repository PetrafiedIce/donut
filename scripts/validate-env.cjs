#!/usr/bin/env node
// Fail early if critical env vars are missing in non-mock mode.
require('dotenv').config()

const REQUIRED = ['DATABASE_URL']

for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`[env] Missing required env var: ${key}`)
    process.exit(1)
  }
}

const isMock = String(process.env.MOCK_MODE || '').toLowerCase() === 'true'

if (!isMock && !process.env.DONUT_API_KEY) {
  console.error('[env] DONUT_API_KEY is required (set MOCK_MODE=true to run without it).')
  process.exit(1)
}

process.exit(0)

