'use client'

import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import YearProgressDesign, {
  YEAR_PROGRESS_VARIANTS,
  type YearProgressData,
} from '@/components/year-progress/year-progress-designs'

export default function YearProgressCardPreview({
  progress,
}: {
  progress: YearProgressData
}) {
  const [variantIndex, setVariantIndex] = useState(0)
  const [iconRotation, setIconRotation] = useState(0)
  const variant = YEAR_PROGRESS_VARIANTS[variantIndex]
  const nextVariant =
    YEAR_PROGRESS_VARIANTS[(variantIndex + 1) % YEAR_PROGRESS_VARIANTS.length]

  function showNextVariant() {
    setVariantIndex(
      (current) => (current + 1) % YEAR_PROGRESS_VARIANTS.length,
    )
    setIconRotation((current) => current + 45)
  }

  return (
    <div className="shine-edge flex h-full min-h-44 flex-1 flex-col rounded-3xl border border-zinc-800/50 bg-zinc-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex min-w-0 items-baseline gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {progress.year} Progress
          </h3>
          <span className="font-mono text-[10px] text-zinc-700" aria-hidden="true">
            {String(variantIndex + 1).padStart(2, '0')}/
            {YEAR_PROGRESS_VARIANTS.length}
          </span>
        </div>
        <button
          type="button"
          onClick={showNextVariant}
          className="relative z-10 -m-3.5 grid size-11 place-items-center rounded-full text-zinc-500 transition-[color,background-color,transform] duration-150 hover:bg-zinc-800 hover:text-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Switch year progress design. Current: ${variant}. Next: ${nextVariant}.`}
          title={`Switch to ${nextVariant} design`}
        >
          <CalendarDays
            className="size-4 transition-transform duration-200 motion-reduce:transition-none"
            style={{ transform: `rotate(${iconRotation}deg)` }}
            aria-hidden="true"
          />
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {variant} year progress design, {variantIndex + 1} of{' '}
        {YEAR_PROGRESS_VARIANTS.length}
      </p>
      <div
        key={variant}
        className="animate-year-progress-swap flex min-h-0 flex-1 flex-col"
      >
        <YearProgressDesign index={variantIndex} progress={progress} />
      </div>
    </div>
  )
}
