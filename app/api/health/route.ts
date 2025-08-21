import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const lastSnapshot = await prisma.auctionSnapshot.findFirst({ orderBy: { capturedAt: 'desc' } })
  const lastFlip = await prisma.flipOpportunity.findFirst({ orderBy: { computedAt: 'desc' } })
  const counts = {
    snapshots: await prisma.auctionSnapshot.count(),
    flips: await prisma.flipOpportunity.count(),
    recipes: await prisma.flipRecipe.count(),
  }
  return NextResponse.json({ lastSnapshotAt: lastSnapshot?.capturedAt ?? null, lastFlipAt: lastFlip?.computedAt ?? null, counts })
}

