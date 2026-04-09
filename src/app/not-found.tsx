import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800/50 bg-zinc-900 p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-50">Page not found</h1>
        <p className="mt-3 text-sm text-zinc-400">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-300"
        >
          Back home
        </Link>
      </div>
    </main>
  )
}
