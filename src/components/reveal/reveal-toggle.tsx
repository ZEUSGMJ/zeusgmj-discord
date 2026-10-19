'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { useReveal } from '@/components/reveal/reveal-context';
import { CONTENT_ENTER_TRANSITION, GRID_ID } from '@/components/reveal/timing';

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
        transition: reduceMotion ? { duration: 0 } : CONTENT_ENTER_TRANSITION,
      }}
      type="button"
      onClick={toggle}
      aria-expanded={targetExpanded}
      aria-controls={GRID_ID}
      aria-label={targetExpanded ? 'Hide details' : 'Show details'}
      className={
        compact
          ? 'liquid-glass relative z-30 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-ink backdrop-blur-md transition-colors [--glass-tint:rgb(255_255_255/0.1)] hover:bg-white/16'
          : 'liquid-glass absolute top-3 right-3 z-30 flex size-8 items-center justify-center rounded-full bg-[#0a0a14]/55 text-ink backdrop-blur-sm transition-colors [--glass-tint:rgb(10_10_20/0.3)] hover:bg-[#0a0a14]/70 lg:top-4 lg:right-4 lg:size-9'
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
        <LuChevronDown className="size-4" />
      </motion.span>
    </motion.button>
  );
}
