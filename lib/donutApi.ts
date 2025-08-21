import { z } from 'zod'
import { env, isMockMode } from '@/lib/env'
import { memoryCache } from '@/lib/cache'

const auctionSchema = z.object({
  id: z.string().optional(),
  itemName: z.string(),
  quantity: z.number(),
  price: z.number(),
  seller: z.string().optional(),
  endsAt: z.string().datetime().optional().or(z.string().optional()),
  nbtHash: z.string().optional(),
  itemId: z.string().optional(),
})

export type AuctionListing = z.infer<typeof auctionSchema>

type FetchOpts = {
  q?: string
  page?: number
  pageSize?: number
  sort?: string
  signal?: AbortSignal
}

const MAX_RETRIES = 3
const TIMEOUT_MS = 10_000

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)) }

async function fetchWithRetry(path: string, params: Record<string, any> = {}, opts: FetchOpts = {}): Promise<any> {
  const url = new URL(path, env.DONUT_API_BASE)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  }

  let attempt = 0
  while (attempt < MAX_RETRIES) {
    attempt++
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${env.DONUT_API_KEY ?? ''}` },
        signal: opts.signal ?? controller.signal,
        cache: 'no-store',
      })
      clearTimeout(timeout)
      if (res.status === 401 || res.status === 403) {
        throw new Error('Donut API authentication failed. Check DONUT_API_KEY.')
      }
      if (res.status === 429) {
        const backoff = 500 * attempt
        await sleep(backoff)
        continue
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const json = await res.json()
      return json
    } catch (err: any) {
      if (attempt >= MAX_RETRIES) throw err
      const backoff = 300 * attempt
      await sleep(backoff)
    }
  }
  throw new Error('Unreachable')
}

export async function getAuctions(params: FetchOpts = {}): Promise<AuctionListing[]> {
  if (isMockMode()) {
    const data = await import('@/server/fixtures/auctions-sample.json')
    return z.array(auctionSchema).parse(data.default)
  }
  const cacheKey = `auctions:${JSON.stringify(params)}`
  const cached = memoryCache.get<AuctionListing[]>(cacheKey)
  if (cached) return cached
  const json = await fetchWithRetry('/auctions', params)
  const listings = Array.isArray(json) ? json : json.items ?? []
  const parsed = z.array(auctionSchema).parse(listings)
  memoryCache.set(cacheKey, parsed, 90_000)
  return parsed
}

export async function getAuctionById(id: string): Promise<AuctionListing | null> {
  if (isMockMode()) {
    const all = await getAuctions({})
    return all.find(a => (a.id ?? '') === id) ?? null
  }
  const json = await fetchWithRetry(`/auctions/${id}`)
  return auctionSchema.parse(json)
}

