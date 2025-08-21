import { describe, it, expect } from 'vitest'
import { computeStacksOutPerStackIn, cheapestStackPrice } from '@/lib/pricing'

describe('computeStacksOutPerStackIn', () => {
  it('bones to bonemeal 1->3 yields 3 stacks out of 1 stack in', () => {
    const stacks = computeStacksOutPerStackIn({
      id: 'x', name: '', inputItem: '', outputItem: '', inputPerCraft: 1, outputPerCraft: 3,
      inputStackSize: 64, outputStackSize: 64, isCompress919: false, metadata: null, active: true
    } as any)
    expect(stacks).toBe(3)
  })
})

describe('cheapestStackPrice', () => {
  it('uses exact stack when available and computes liquidity', () => {
    const res = cheapestStackPrice([
      { id: '1', itemName: 'Bone', quantity: 64, price: 1200, seller: 'a', capturedAt: new Date(), sourceRaw: {} },
      { id: '2', itemName: 'Bone', quantity: 64, price: 1250, seller: 'b', capturedAt: new Date(), sourceRaw: {} },
    ] as any, 64)
    expect(res?.stackPrice).toBe(1200)
  })
})

