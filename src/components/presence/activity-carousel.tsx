'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import ActivityRow, {
  type CarouselItem,
} from '@/components/presence/activity-row';
import { DUR_ITEM, DUR_MICRO, EASE_OUT } from '@/components/reveal/timing';

const SLIDE_OFFSET = 16;
const ARROW_CLASS =
  '-my-3 w-3.5 shrink-0 py-3 text-center text-xl leading-none text-(--cft-hi) transition-[color,opacity] hover:text-(--cft-mid) disabled:cursor-default disabled:opacity-30 disabled:hover:text-(--cft-hi) lg:w-5 lg:text-[22px]';

export default function ActivityCarousel({ items }: { items: CarouselItem[] }) {
  const [position, setPosition] = useState({ index: 0, direction: 1 });
  const reduceMotion = useReducedMotion() ?? false;

  if (items.length === 0) return null;

  if (items.length === 1) {
    return <ActivityRow item={items[0]} />;
  }

  const safeIndex = Math.min(position.index, items.length - 1);

  function goTo(next: number) {
    const clamped = Math.min(items.length - 1, Math.max(0, next));
    if (clamped === safeIndex) return;
    setPosition({ index: clamped, direction: clamped > safeIndex ? 1 : -1 });
  }

  const offset = (direction: number) =>
    reduceMotion
      ? 'translateX(0px)'
      : `translateX(${direction * SLIDE_OFFSET}px)`;

  return (
    <div
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Activity carousel"
      className="flex flex-col items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-(--cft-dim) lg:gap-3.5"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goTo(safeIndex - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goTo(safeIndex + 1);
        }
      }}
    >
      <div className="flex w-full items-center gap-2.5 lg:gap-4">
        <button
          type="button"
          onClick={() => goTo(safeIndex - 1)}
          disabled={safeIndex === 0}
          className={ARROW_CLASS}
          aria-label="Previous activity"
        >
          ‹
        </button>
        <div className="relative min-w-0 flex-1">
          <AnimatePresence
            mode="popLayout"
            initial={false}
            custom={position.direction}
          >
            <motion.div
              key={safeIndex}
              role="group"
              aria-roledescription="slide"
              aria-label={`${safeIndex + 1} of ${items.length}`}
              custom={position.direction}
              initial={{ opacity: 0, transform: offset(position.direction) }}
              animate={{
                opacity: 1,
                transform: 'translateX(0px)',
                transition: { duration: DUR_ITEM, ease: EASE_OUT },
              }}
              exit={{
                opacity: 0,
                transform: offset(-position.direction),
                transition: { duration: DUR_MICRO, ease: EASE_OUT },
              }}
            >
              <ActivityRow item={items[safeIndex]} />
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => goTo(safeIndex + 1)}
          disabled={safeIndex === items.length - 1}
          className={ARROW_CLASS}
          aria-label="Next activity"
        >
          ›
        </button>
      </div>
      <div className="flex gap-[7px] lg:gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className="group -m-1.5 p-1.5"
            aria-label={`Activity ${i + 1}`}
            aria-current={i === safeIndex}
          >
            <span
              className={`block size-[7px] rounded-full transition-colors lg:size-2 ${
                i === safeIndex
                  ? 'bg-(--cft-hi)'
                  : 'bg-(--cft-dim)/60 group-hover:bg-(--cft-dim)'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
