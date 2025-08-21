import Link from 'next/link'

export default async function HomePage() {
  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">DonutSMP Flip Finder</h1>
        <div className="space-x-3">
          <Link href="/flips" className="underline">View Flips</Link>
          <Link href="/admin" className="underline">Admin</Link>
        </div>
      </header>
      <section>
        <p className="text-sm opacity-80">Use the header to navigate. Configure your environment, then trigger a refresh to populate flips.</p>
      </section>
    </main>
  )
}

