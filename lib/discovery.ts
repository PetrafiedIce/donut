import { env } from '@/lib/env'

type DiscoveryResult = {
  listPath: string
  detailPath?: string
  envelopeKey?: 'items' | 'data' | 'results' | null
}

const SWAGGER_CANDIDATES = [
  '/swagger/v1/swagger.json',
  '/swagger/v1/openapi.json',
  '/swagger.json',
  '/openapi.json',
  '/openapi/v1.json'
]

async function fetchJson(path: string): Promise<any | null> {
  try {
    const url = new URL(path, env.DONUT_API_BASE)
    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${env.DONUT_API_KEY ?? ''}` },
      cache: 'no-store'
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function discoverFromSwagger(): Promise<DiscoveryResult | null> {
  for (const p of SWAGGER_CANDIDATES) {
    const spec = await fetchJson(p)
    if (!spec) continue
    const paths = spec.paths || spec.paths
    if (!paths) continue
    let listPath: string | null = null
    let detailPath: string | undefined
    for (const k of Object.keys(paths)) {
      const lower = k.toLowerCase()
      if (!listPath && (lower.includes('auction') || lower.includes('market'))) {
        const ops = paths[k]
        if (ops.get) listPath = k
        if (!detailPath && k.includes('{') && k.includes('}')) detailPath = k
      }
    }
    if (listPath) {
      // Attempt to guess envelope key from components
      const envelopeKey: DiscoveryResult['envelopeKey'] = 'items'
      return { listPath, detailPath, envelopeKey }
    }
  }
  return null
}

export async function loadKnownPaths(): Promise<string[]> {
  try {
    const cfg = await import('@/server/donut.config.json')
    const arr = (cfg as any).default?.knownPaths || (cfg as any).knownPaths
    if (Array.isArray(arr)) return arr
  } catch {}
  return ['/auctions']
}

