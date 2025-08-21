import { NextRequest, NextResponse } from 'next/server'
import { getAuctions } from '@/lib/donutApi'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? undefined
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize') ?? '50')
  const sort = searchParams.get('sort') ?? undefined
  try {
    const results = await getAuctions({ q, page, pageSize, sort })
    return NextResponse.json({ items: results })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 })
  }
}

