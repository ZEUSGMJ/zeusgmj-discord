'use client'

import { useState } from 'react'
import ActivityRow, { type CarouselItem } from '@/components/ui/activity-row'

export default function ActivityCarousel({ items }: { items: CarouselItem[] }) {
  const [index, setIndex] = useState(0)

  if (items.length === 0) return null

  if (items.length === 1) {
    return <ActivityRow item={items[0]} />
  }

  const safeIndex = Math.min(index, items.length - 1)

  return (
    <div
      tabIndex={0}
      aria-label="Activity carousel"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          setIndex((i) => Math.max(0, i - 1))
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          setIndex((i) => Math.min(items.length - 1, i + 1))
        }
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={safeIndex === 0}
          className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-default text-lg leading-none shrink-0 w-5 text-center transition-colors"
          aria-label="Previous activity"
        >
          ‹
        </button>
        <div className="flex-1 min-w-0">
          <ActivityRow item={items[safeIndex]} />
        </div>
        <button
          onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          disabled={safeIndex === items.length - 1}
          className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-default text-lg leading-none shrink-0 w-5 text-center transition-colors"
          aria-label="Next activity"
        >
          ›
        </button>
      </div>
      <div className="flex justify-center gap-1.5 mt-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === safeIndex ? 'bg-zinc-300' : 'bg-zinc-600 hover:bg-zinc-500'}`}
            aria-label={`Activity ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
