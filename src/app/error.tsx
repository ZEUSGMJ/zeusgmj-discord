'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800/50 bg-zinc-900 p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Page error
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-50">Something went wrong</h1>
        <p className="mt-3 text-sm text-zinc-400">
          This page hit an unexpected error while rendering. Try loading it again.
        </p>
        {error.digest ? (
          <p className="mt-4 text-xs text-zinc-600">Error ID: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 inline-flex rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-300"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
