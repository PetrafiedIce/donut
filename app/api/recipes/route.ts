import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const recipes = await prisma.flipRecipe.findMany({ include: { aliases: true } })
  return NextResponse.json(recipes)
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD
  const header = req.headers.get('x-admin-password')
  if (!adminPassword || header !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const created = await prisma.flipRecipe.create({ data: body })
  return NextResponse.json(created)
}

