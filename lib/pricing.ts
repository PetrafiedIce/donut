import { AuctionSnapshot, FlipRecipe } from '@prisma/client'

export type CheapestResult = {
  stackPrice: number
  liquidityNote: 'low' | 'ok' | 'high'
  sampleListingIds: string[]
}

export function computeStacksOutPerStackIn(recipe: FlipRecipe): number {
  const inPerCraft = recipe.inputPerCraft
  const outPerCraft = recipe.outputPerCraft
  const inputStack = recipe.inputStackSize
  const outputStack = recipe.outputStackSize
  return (inputStack / inPerCraft) * (outPerCraft / outputStack)
}

export function cheapestStackPrice(listings: AuctionSnapshot[], desiredStackSize: number): CheapestResult | null {
  if (!listings.length) return null
  const sorted = [...listings].sort((a, b) => a.price - b.price)
  const exactStacks = sorted.filter(l => l.quantity === desiredStackSize)
  let liquidity: CheapestResult['liquidityNote'] = 'low'
  let sampleIds: string[] = []
  if (exactStacks.length >= 1) {
    const cheapest = exactStacks[0]
    // Liquidity: how many listings within +10% of cheapest
    const near = exactStacks.filter(l => l.price <= Math.ceil(cheapest.price * 1.1))
    liquidity = near.length >= 10 ? 'high' : near.length >= 5 ? 'ok' : 'low'
    sampleIds = near.slice(0, 10).map(l => l.id)
    return { stackPrice: cheapest.price, liquidityNote: liquidity, sampleListingIds: sampleIds }
  }
  // no exact stacks; compute per-unit and scale
  const perUnit = sorted[0].price / sorted[0].quantity
  const stackPrice = Math.ceil(perUnit * desiredStackSize)
  liquidity = 'low'
  sampleIds = sorted.slice(0, 5).map(l => l.id)
  return { stackPrice, liquidityNote: liquidity, sampleListingIds: sampleIds }
}

