'use client';

import { ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { useReveal } from '@/components/reveal/reveal-context';
import {
  DELAY_CONTENT_ENTER,
  DUR_ITEM,
  EASE_OUT,
  GRID_ID,
} from '@/components/reveal/timing';

export default function RevealToggle({ compact }: { compact: boolean }) {
  const { targetExpanded, toggle, collapse } = useReveal();
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') collapse();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collapse]);

  return (
    <motion.button
      layout="position"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          duration: reduceMotion ? 0 : DUR_ITEM,
          delay: reduceMotion ? 0 : DELAY_CONTENT_ENTER,
          ease: EASE_OUT,
        },
      }}
      type="button"
      onClick={toggle}
      aria-expanded={targetExpanded}
      aria-controls={GRID_ID}
      aria-label={targetExpanded ? 'Hide details' : 'Show details'}
      className={
        compact
          ? 'relative z-30 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-ink backdrop-blur-md transition-colors hover:bg-white/16 lg:size-9'
          : 'absolute top-3 right-3 z-30 flex size-8 items-center justify-center rounded-full bg-[#0a0a14]/55 text-ink backdrop-blur-sm transition-colors hover:bg-[#0a0a14]/70 lg:top-5 lg:right-5 lg:size-10'
      }
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
    >
      <motion.span
        className="flex items-center justify-center"
        animate={{
          rotate: reduceMotion ? 0 : targetExpanded ? 180 : 0,
        }}
        transition={{
          rotate: reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 300, damping: 22 },
        }}
      >
        <ChevronDown className="size-4" />
      </motion.span>
    </motion.button>
  );
}
