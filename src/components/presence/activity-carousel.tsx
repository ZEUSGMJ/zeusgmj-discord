'use client';

import { useState } from 'react';
import ActivityRow, {
  type CarouselItem,
} from '@/components/presence/activity-row';

export default function ActivityCarousel({ items }: { items: CarouselItem[] }) {
  const [index, setIndex] = useState(0);

  if (items.length === 0) return null;

  if (items.length === 1) {
    return <ActivityRow item={items[0]} />;
  }

  const safeIndex = Math.min(index, items.length - 1);

  return (
    <div
      tabIndex={0}
      aria-label="Activity carousel"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setIndex((i) => Math.max(0, i - 1));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setIndex((i) => Math.min(items.length - 1, i + 1));
        }
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={safeIndex === 0}
          className="w-5 shrink-0 text-center text-lg leading-none text-(--cft-dim) transition-colors hover:text-(--cft-mid) disabled:cursor-default disabled:opacity-30"
          aria-label="Previous activity"
        >
          ‹
        </button>
        <div className="min-w-0 flex-1">
          <ActivityRow item={items[safeIndex]} />
        </div>
        <button
          onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          disabled={safeIndex === items.length - 1}
          className="w-5 shrink-0 text-center text-lg leading-none text-(--cft-dim) transition-colors hover:text-(--cft-mid) disabled:cursor-default disabled:opacity-30"
          aria-label="Next activity"
        >
          ›
        </button>
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i === safeIndex ? 'bg-(--cft-mid)' : 'bg-(--cft-dim) hover:bg-(--cft-dot-hover)'}`}
            aria-label={`Activity ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
