import { NextResponse } from 'next/server'
import { discoverFromSwagger } from '@/lib/discovery'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sw = await discoverFromSwagger()
  if (sw) return NextResponse.json({ source: 'swagger', discovery: sw })
  return NextResponse.json({ source: 'inferred', warning: 'Using inferred endpoints' })
}

