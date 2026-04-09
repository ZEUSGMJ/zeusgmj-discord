'use client'

import type { ReactNode } from 'react'
import { unstable_catchError, type ErrorInfo } from 'next/error'

type CardErrorBoundaryProps = {
  children: ReactNode
  title?: string
}

function CardErrorFallback(
  { title = 'Section' }: Omit<CardErrorBoundaryProps, 'children'>,
  { error, unstable_retry }: ErrorInfo,
) {
  const digest = (error as Error & { digest?: string }).digest

  return (
    <div className="flex h-full min-h-52 flex-col justify-between rounded-3xl border border-zinc-800/50 bg-zinc-900 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {title}
        </p>
        <h3 className="mt-3 text-base font-semibold text-zinc-50">Could not render this card</h3>
        <p className="mt-2 text-sm text-zinc-400">
          A temporary rendering error occurred. You can retry this card without reloading the page.
        </p>
        {digest ? (
          <p className="mt-3 text-xs text-zinc-600">Error ID: {digest}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-6 inline-flex w-fit rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-300"
      >
        Retry card
      </button>
    </div>
  )
}

export default unstable_catchError(CardErrorFallback)
