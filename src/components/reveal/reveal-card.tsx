'use client'

import { motion, useAnimationControls, useReducedMotion, type Variants } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReveal } from '@/components/reveal/reveal-context'
import {
  DUR_CARD_ENTER,
  DUR_CARD_EXIT,
  DUR_MICRO,
  EASE_IN,
  EASE_OUT,
  PROFILE_SETTLE_TRANSITION,
  SHELL_SETTLE_DELAY,
  type CardWave,
} from '@/components/reveal/timing'

interface RevealCardProps {
  children: ReactNode
  cardId: RevealCardId
  generation: number
  wave: CardWave
  className?: string
  onEnterComplete: (cardId: RevealCardId, generation: number) => void
}

export type RevealCardId = 'column' | 'tracks' | 'games' | 'media'

export default function RevealCard({
  children,
  cardId,
  generation,
  wave,
  className,
  onEnterComplete,
}: RevealCardProps) {
  const { targetExpanded, profileSettle } = useReveal()
  const reduceMotion = useReducedMotion() ?? false
  const [reveal, setReveal] = useState<'waiting' | 'in' | 'out'>('waiting')
  const reportedGenerationRef = useRef<number | null>(null)
  const pulsedRevisionRef = useRef<number | null>(null)
  const pulseControls = useAnimationControls()

  useEffect(() => {
    const timer = setTimeout(() => setReveal(targetExpanded ? 'waiting' : 'out'), 0)
    return () => clearTimeout(timer)
  }, [targetExpanded])

  useEffect(() => {
    pulseControls.stop()
    pulseControls.set({ scale: 1 })

    if (
      reduceMotion
      || !targetExpanded
      || !profileSettle
      || profileSettle.direction !== 'expanded'
      || profileSettle.generation !== generation
      || pulsedRevisionRef.current === profileSettle.revision
    ) return

    pulsedRevisionRef.current = profileSettle.revision
    const timer = setTimeout(() => {
      pulseControls.set({ scale: 1.012 })
      void pulseControls.start({ scale: 1, transition: PROFILE_SETTLE_TRANSITION })
    }, SHELL_SETTLE_DELAY * 1000)

    return () => {
      clearTimeout(timer)
      pulseControls.stop()
      pulseControls.set({ scale: 1 })
    }
  }, [generation, profileSettle, pulseControls, reduceMotion, targetExpanded])

  const variants: Variants = {
    initial: {
      opacity: 0,
      x: reduceMotion ? 0 : wave.from.x ?? 0,
      y: reduceMotion ? 0 : wave.from.y ?? 0,
      transition: {
        duration: reduceMotion ? DUR_MICRO : DUR_CARD_EXIT,
        ease: EASE_IN,
      },
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: reduceMotion ? DUR_MICRO : DUR_CARD_ENTER,
        delay: reduceMotion ? 0 : wave.delay,
        ease: EASE_OUT,
      },
    },
    exit: {
      opacity: 0,
      x: reduceMotion ? 0 : wave.from.x ?? 0,
      y: reduceMotion ? 0 : wave.from.y ?? 0,
      transition: {
        duration: reduceMotion ? DUR_MICRO : DUR_CARD_EXIT,
        ease: EASE_IN,
      },
    },
  }

  return (
    <motion.div
      data-reveal={reveal}
      className={className ? 'h-full' : undefined}
      variants={variants}
      initial="initial"
      animate={targetExpanded ? 'visible' : 'exit'}
      exit="exit"
      onAnimationComplete={(definition) => {
        if (definition !== 'visible' || !targetExpanded) return
        setReveal('in')
        if (reportedGenerationRef.current === generation) return
        reportedGenerationRef.current = generation
        onEnterComplete(cardId, generation)
      }}
    >
      <motion.div
        initial={false}
        animate={pulseControls}
        className={className ? `${className} origin-center` : 'h-full origin-center'}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
