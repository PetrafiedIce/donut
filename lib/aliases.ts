import { prisma } from '@/lib/db'

export async function normalizeItemName(name: string): Promise<string> {
  const lower = name.toLowerCase()
  const alias = await prisma.flipRecipeAlias.findFirst({ where: { name: lower }, include: { recipe: true } })
  if (alias) {
    // Prefer canonical input/output names; if alias matches one, return that
    const candidates = [alias.recipe.inputItem, alias.recipe.outputItem].map(s => s.toLowerCase())
    if (candidates.includes(lower)) return alias.recipe.inputItem.toLowerCase() === lower ? alias.recipe.inputItem : alias.recipe.outputItem
    // Otherwise return input item as canonical
    return alias.recipe.inputItem
  }
  return name
}

