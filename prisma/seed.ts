import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type RecipeSeed = {
  name: string
  inputItem: string
  outputItem: string
  inputPerCraft: number
  outputPerCraft: number
  inputStackSize?: number
  outputStackSize?: number
  isCompress919?: boolean
  aliases?: string[]
}

const recipes: RecipeSeed[] = [
  { name: 'Bones → Bonemeal', inputItem: 'Bone', outputItem: 'Bone Meal', inputPerCraft: 1, outputPerCraft: 3, aliases: ['BONE', 'BONES', 'BONE_MEAL', 'BONEMEAL'] },
  { name: 'Blaze Rod → Blaze Powder', inputItem: 'Blaze Rod', outputItem: 'Blaze Powder', inputPerCraft: 1, outputPerCraft: 2, aliases: ['BLAZE_ROD', 'BLAZE_POWDER'] },
  { name: 'Log → Planks (Oak)', inputItem: 'Oak Log', outputItem: 'Oak Planks', inputPerCraft: 1, outputPerCraft: 4, aliases: ['LOG', 'PLANKS'] },
  { name: 'String → Wool', inputItem: 'String', outputItem: 'White Wool', inputPerCraft: 4, outputPerCraft: 1, aliases: ['STRING', 'WOOL'] },
  { name: 'Sugar Cane → Paper', inputItem: 'Sugar Cane', outputItem: 'Paper', inputPerCraft: 3, outputPerCraft: 3, aliases: ['SUGAR_CANE', 'PAPER'] },
  { name: 'Quartz → Quartz Block', inputItem: 'Quartz', outputItem: 'Quartz Block', inputPerCraft: 4, outputPerCraft: 1, aliases: ['QUARTZ', 'QUARTZ_BLOCK'] },
  { name: 'Slimeball → Slime Block', inputItem: 'Slimeball', outputItem: 'Slime Block', inputPerCraft: 9, outputPerCraft: 1, aliases: ['SLIMEBALL', 'SLIME_BLOCK'], isCompress919: true },
  // 9→1 compressions
  { name: 'Redstone → Redstone Block', inputItem: 'Redstone', outputItem: 'Redstone Block', inputPerCraft: 9, outputPerCraft: 1, isCompress919: true, aliases: ['REDSTONE', 'REDSTONE_BLOCK'] },
  { name: 'Coal → Coal Block', inputItem: 'Coal', outputItem: 'Block of Coal', inputPerCraft: 9, outputPerCraft: 1, isCompress919: true, aliases: ['COAL', 'COAL_BLOCK'] },
  { name: 'Lapis → Lapis Block', inputItem: 'Lapis Lazuli', outputItem: 'Lapis Lazuli Block', inputPerCraft: 9, outputPerCraft: 1, isCompress919: true, aliases: ['LAPIS', 'LAPIS_BLOCK'] },
  { name: 'Iron → Iron Block', inputItem: 'Iron Ingot', outputItem: 'Block of Iron', inputPerCraft: 9, outputPerCraft: 1, isCompress919: true, aliases: ['IRON', 'IRON_BLOCK'] },
  { name: 'Gold → Gold Block', inputItem: 'Gold Ingot', outputItem: 'Block of Gold', inputPerCraft: 9, outputPerCraft: 1, isCompress919: true, aliases: ['GOLD', 'GOLD_BLOCK'] },
  { name: 'Copper → Copper Block', inputItem: 'Copper Ingot', outputItem: 'Block of Copper', inputPerCraft: 9, outputPerCraft: 1, isCompress919: true, aliases: ['COPPER', 'COPPER_BLOCK'] },
  { name: 'Emerald → Emerald Block', inputItem: 'Emerald', outputItem: 'Block of Emerald', inputPerCraft: 9, outputPerCraft: 1, isCompress919: true, aliases: ['EMERALD', 'EMERALD_BLOCK'] },
  { name: 'Diamond → Diamond Block', inputItem: 'Diamond', outputItem: 'Block of Diamond', inputPerCraft: 9, outputPerCraft: 1, isCompress919: true, aliases: ['DIAMOND', 'DIAMOND_BLOCK'] }
]

async function main() {
  for (const r of recipes) {
    let recipe = await prisma.flipRecipe.findFirst({ where: { name: r.name } })
    if (!recipe) {
      recipe = await prisma.flipRecipe.create({
        data: {
          name: r.name,
          inputItem: r.inputItem,
          outputItem: r.outputItem,
          inputPerCraft: r.inputPerCraft,
          outputPerCraft: r.outputPerCraft,
          inputStackSize: r.inputStackSize ?? 64,
          outputStackSize: r.outputStackSize ?? 64,
          isCompress919: r.isCompress919 ?? false,
        }
      })
    }

    if (r.aliases && r.aliases.length) {
      for (const alias of r.aliases) {
        await prisma.flipRecipeAlias.upsert({
          where: { recipeId_name: { recipeId: recipe.id, name: alias.toLowerCase() } },
          create: { recipeId: recipe.id, name: alias.toLowerCase() },
          update: {},
        })
      }
      // Also include canonical item names as aliases for normalization
      for (const canonical of [r.inputItem, r.outputItem]) {
        await prisma.flipRecipeAlias.upsert({
          where: { recipeId_name: { recipeId: recipe.id, name: canonical.toLowerCase() } },
          create: { recipeId: recipe.id, name: canonical.toLowerCase() },
          update: {},
        })
      }
    }
  }
}

main().then(async () => {
  await prisma.$disconnect()
}).catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})

