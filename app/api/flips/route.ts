import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sort = searchParams.get('sort') ?? 'score'
  const minRoi = Number(searchParams.get('minRoi') ?? '0')
  const minProfit = Number(searchParams.get('minProfit') ?? '0')
  const liquidity = searchParams.get('liquidity')
  const q = searchParams.get('q')?.toLowerCase()
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200)

  const where: any = {
    roiPercent: { gte: minRoi },
    profitPerStack: { gte: minProfit },
  }
  if (liquidity && ['low', 'ok', 'high'].includes(liquidity)) where.liquidityNote = liquidity

  const orderBy = sort === 'roi' ? { roiPercent: 'desc' } : sort === 'profit' ? { profitPerStack: 'desc' } : { score: 'desc' }

  const flips = await prisma.flipOpportunity.findMany({
    where,
    orderBy,
    take: limit,
    include: { recipe: true }
  })

  const filtered = q
    ? flips.filter(f => f.recipe.name.toLowerCase().includes(q) || f.recipe.inputItem.toLowerCase().includes(q) || f.recipe.outputItem.toLowerCase().includes(q))
    : flips

  return NextResponse.json(filtered)
}

