"use client"
import { useEffect, useState } from 'react'

type Recipe = {
  id: string
  name: string
  inputItem: string
  outputItem: string
  inputPerCraft: number
  outputPerCraft: number
  inputStackSize: number
  outputStackSize: number
  isCompress919: boolean
  active: boolean
}

export default function AdminPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/recipes', { cache: 'no-store' })
    const json = await res.json()
    setRecipes(json)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  return (
    <main className="p-4 max-w-6xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Admin</h1>
      {loading && <p>Loading…</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Input</th>
              <th className="py-2 pr-4">Output</th>
              <th className="py-2 pr-4">Ratios</th>
              <th className="py-2 pr-4">Active</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map(r => (
              <tr key={r.id} className="border-b">
                <td className="py-2 pr-4">{r.name}</td>
                <td className="py-2 pr-4">{r.inputItem}</td>
                <td className="py-2 pr-4">{r.outputItem}</td>
                <td className="py-2 pr-4">{r.inputPerCraft} → {r.outputPerCraft}</td>
                <td className="py-2 pr-4">{r.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

