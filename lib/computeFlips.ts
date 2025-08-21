import { prisma } from '@/lib/db'
import { getAuctions, AuctionListing } from '@/lib/donutApi'
import { cheapestStackPrice, computeStacksOutPerStackIn } from '@/lib/pricing'

type Grouped = Record<string, AuctionListing[]>

function groupByItem(listings: AuctionListing[]): Grouped {
  return listings.reduce<Grouped>((acc, l) => {
    const key = l.itemName
    if (!acc[key]) acc[key] = []
    acc[key].push(l)
    return acc
  }, {})
}

export async function refreshAuctionsAndComputeFlips() {
  const listings = await getAuctions({ pageSize: 200 })
  // store snapshots
  const created = await prisma.$transaction(async (tx) => {
    const createdSnapshots = await Promise.all(listings.map(l => tx.auctionSnapshot.create({
      data: {
        itemName: l.itemName,
        itemId: l.itemId,
        nbtHash: l.nbtHash,
        quantity: l.quantity,
        price: l.price,
        seller: l.seller,
        endsAt: l.endsAt ? new Date(l.endsAt) : null,
        sourceRaw: JSON.stringify(l),
      }
    })))
    return createdSnapshots
  })

  const grouped = groupByItem(listings)
  const recipes = await prisma.flipRecipe.findMany({ where: { active: true } })

  const opportunitiesData = [] as {
    recipeId: string
    inputStackPrice: number
    outputStackPrice: number
    stacksOutPerStackIn: number
    grossPerInputStack: number
    profitPerStack: number
    roiPercent: number
    liquidityNote: string
    sampleListings: any
    score: number
  }[]

  for (const recipe of recipes) {
    const inputListings = grouped[recipe.inputItem] ?? []
    const outputListings = grouped[recipe.outputItem] ?? []

    const inputCheapest = cheapestStackPrice(inputListings as any, recipe.inputStackSize)
    const outputCheapest = cheapestStackPrice(outputListings as any, recipe.outputStackSize)
    if (!inputCheapest || !outputCheapest) continue

    const stacksOut = computeStacksOutPerStackIn(recipe)
    const gross = Math.floor(stacksOut * outputCheapest.stackPrice)
    const profit = gross - inputCheapest.stackPrice
    const roi = inputCheapest.stackPrice > 0 ? (profit / inputCheapest.stackPrice) * 100 : 0
    const liquidityNote = (inputCheapest.liquidityNote === 'low' || outputCheapest.liquidityNote === 'low') ? 'low' : (inputCheapest.liquidityNote === 'ok' || outputCheapest.liquidityNote === 'ok') ? 'ok' : 'high'
    const liquidityFactor = liquidityNote === 'high' ? 1.0 : liquidityNote === 'ok' ? 0.7 : 0.4
    const score = roi * liquidityFactor

    opportunitiesData.push({
      recipeId: recipe.id,
      inputStackPrice: inputCheapest.stackPrice,
      outputStackPrice: outputCheapest.stackPrice,
      stacksOutPerStackIn: stacksOut,
      grossPerInputStack: gross,
      profitPerStack: profit,
      roiPercent: roi,
      liquidityNote,
      sampleListings: JSON.stringify({ input: inputCheapest.sampleListingIds, output: outputCheapest.sampleListingIds }),
      score,
    })
  }

  await prisma.$transaction(async (tx) => {
    // optional retention policy later
    for (const o of opportunitiesData) {
      await tx.flipOpportunity.create({ data: o })
    }
  })

  return {
    createdSnapshots: created.length,
    computedOpportunities: opportunitiesData.length,
  }
}

