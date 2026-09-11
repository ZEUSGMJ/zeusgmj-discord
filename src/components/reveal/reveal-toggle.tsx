'use client'

import { ChevronDown } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { useReveal } from '@/components/reveal/reveal-context'
import { GRID_ID } from '@/components/reveal/timing'

export default function RevealToggle({ compact }: { compact: boolean }) {
  const { targetExpanded, toggle, collapse } = useReveal()
  const reduceMotion = useReducedMotion() ?? false

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') collapse()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [collapse])

  return (
    <motion.button
      layout="position"
      type="button"
      onClick={toggle}
      aria-expanded={targetExpanded}
      aria-controls={GRID_ID}
      aria-label={targetExpanded ? 'Hide details' : 'Show details'}
      className={
        compact
          ? 'relative z-30 flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-zinc-300 backdrop-blur-sm transition-colors hover:text-zinc-100'
          : 'absolute right-4 top-4 z-30 flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-zinc-300 backdrop-blur-sm transition-colors hover:text-zinc-100'
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
  )
}
