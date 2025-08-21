"use client"
import { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/Modal'

type FlipRow = {
  id: string
  recipe: { name: string, inputItem: string, outputItem: string }
  inputStackPrice: number
  outputStackPrice: number
  stacksOutPerStackIn: number
  profitPerStack: number
  roiPercent: number
  liquidityNote: string | null
  sampleListings: { input: string[], output: string[] } | null
}

export default function FlipsPage() {
  const [rows, setRows] = useState<FlipRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<'score'|'roi'|'profit'>('score')
  const [minRoi, setMinRoi] = useState(0)
  const [minProfit, setMinProfit] = useState(0)
  const [q, setQ] = useState('')
  const [liquidity, setLiquidity] = useState<'all'|'low'|'ok'|'high'>('all')
  const [listingsModal, setListingsModal] = useState<{ title: string, items: any[] } | null>(null)

  async function fetchFlips() {
    setLoading(true); setError(null)
    const params = new URLSearchParams()
    params.set('sort', sort)
    params.set('minRoi', String(minRoi))
    params.set('minProfit', String(minProfit))
    if (q) params.set('q', q)
    if (liquidity !== 'all') params.set('liquidity', liquidity)
    const res = await fetch('/api/flips?' + params.toString(), { cache: 'no-store' })
    if (!res.ok) { setError('Failed to load flips'); setLoading(false); return }
    const json = await res.json()
    setRows(json)
    setLoading(false)
  }

  useEffect(() => { fetchFlips() }, [])

  const handleRefresh = async () => {
    setLoading(true)
    await fetch('/api/jobs/refresh', { method: 'POST' })
    await fetchFlips()
  }

  const displayRows = useMemo(() => rows, [rows])

  return (
    <main className="p-4 max-w-7xl mx-auto space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Flip Leaderboard</h1>
        <button onClick={handleRefresh} className="underline">Refresh</button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-sm">Search</label>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="item" className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="text-sm">Sort</label>
          <select className="w-full border rounded px-2 py-1" value={sort} onChange={e=>setSort(e.target.value as any)}>
            <option value="score">Score</option>
            <option value="roi">ROI%</option>
            <option value="profit">Profit/stack</option>
          </select>
        </div>
        <div>
          <label className="text-sm">Min ROI%</label>
          <input type="number" className="w-full border rounded px-2 py-1" value={minRoi} onChange={e=>setMinRoi(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm">Min Profit</label>
          <input type="number" className="w-full border rounded px-2 py-1" value={minProfit} onChange={e=>setMinProfit(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm">Liquidity</label>
          <select className="w-full border rounded px-2 py-1" value={liquidity} onChange={e=>setLiquidity(e.target.value as any)}>
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="ok">OK</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="md:col-span-5 flex gap-2">
          <button className="border rounded px-3 py-1" onClick={fetchFlips}>Apply</button>
          {loading && <span className="text-sm opacity-70">Loading…</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Recipe</th>
              <th className="py-2 pr-4">Input Stack</th>
              <th className="py-2 pr-4">Output Stack</th>
              <th className="py-2 pr-4">Stacks Out/In</th>
              <th className="py-2 pr-4">Profit/Stack</th>
              <th className="py-2 pr-4">ROI%</th>
              <th className="py-2 pr-4">Liquidity</th>
              <th className="py-2 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map(f => (
              <tr key={f.id} className="border-b">
                <td className="py-2 pr-4">{f.recipe.name}</td>
                <td className="py-2 pr-4">{f.inputStackPrice.toLocaleString()}</td>
                <td className="py-2 pr-4">{f.outputStackPrice.toLocaleString()}</td>
                <td className="py-2 pr-4">{f.stacksOutPerStackIn.toFixed(2)}</td>
                <td className="py-2 pr-4">{f.profitPerStack.toLocaleString()}</td>
                <td className="py-2 pr-4">{f.roiPercent.toFixed(1)}%</td>
                <td className="py-2 pr-4">{f.liquidityNote}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <button className="underline" onClick={async ()=>{
                      const res = await fetch(`/api/auctions/search?q=${encodeURIComponent(f.recipe.inputItem)}&pageSize=10`)
                      const json = await res.json()
                      setListingsModal({ title: `Input Listings: ${f.recipe.inputItem}`, items: json.items })
                    }}>View Input Listings</button>
                    <button className="underline" onClick={async ()=>{
                      const res = await fetch(`/api/auctions/search?q=${encodeURIComponent(f.recipe.outputItem)}&pageSize=10`)
                      const json = await res.json()
                      setListingsModal({ title: `Output Listings: ${f.recipe.outputItem}`, items: json.items })
                    }}>View Output Listings</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!listingsModal} onClose={()=>setListingsModal(null)} title={listingsModal?.title || ''}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Seller</th>
                <th className="py-2 pr-4">Quantity</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Ends</th>
              </tr>
            </thead>
            <tbody>
              {listingsModal?.items?.map((it: any, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 pr-4">{it.seller || '-'}</td>
                  <td className="py-2 pr-4">{it.quantity}</td>
                  <td className="py-2 pr-4">{Number(it.price).toLocaleString()}</td>
                  <td className="py-2 pr-4">{it.endsAt ? new Date(it.endsAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </main>
  )
}

