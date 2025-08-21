import { NextResponse } from 'next/server'
import { refreshAuctionsAndComputeFlips } from '@/lib/computeFlips'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const summary = await refreshAuctionsAndComputeFlips()
    return NextResponse.json({ ok: true, ...summary })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}

