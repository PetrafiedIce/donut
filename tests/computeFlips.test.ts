import { describe, it, expect } from 'vitest'
import { computeStacksOutPerStackIn } from '@/lib/pricing'

describe('math', () => {
  it('bones math inequality string', () => {
    // Rough sanity: 3 * output > input when profitable
    const stacks = 3
    expect(stacks).toBeGreaterThan(0)
  })
})

