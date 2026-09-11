'use client';

import { HalftoneDots } from '@paper-design/shaders-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Component, type ReactNode } from 'react';
import { usePresence } from '@/components/presence/presence-provider';
import { useReveal } from '@/components/reveal/reveal-context';
import {
  DUR_FOOTER_EXIT,
  DUR_FOOTER_MOUNTAIN_ENTER,
  DUR_FOOTER_MOUNTAIN_EXIT,
  DUR_FOOTER_WORDMARK_ENTER,
  DUR_FOOTER_WORDMARK_EXIT,
  EASE_IN,
  EASE_OUT,
  FOOTER_REVEAL_DELAY,
} from '@/components/reveal/timing';

class ShaderBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch() {}

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function withAlpha(hex: string, alpha: number) {
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
}

export default function FooterBackground() {
  const {
    targetExpanded,
    detailsMounted,
    footerExitPending,
    footerExitCancelled,
    intentGeneration,
    profileSettle,
  } = useReveal();
  const { themeColor2 } = usePresence();
  const accentColor = themeColor2 ?? '#71717B';
  const reduceMotion = useReducedMotion() ?? false;
  const readyToReveal = reduceMotion
    ? targetExpanded && detailsMounted
    : targetExpanded &&
      profileSettle?.direction === 'expanded' &&
      profileSettle.generation === intentGeneration;
  const revealDelay =
    reduceMotion || footerExitCancelled ? 0 : FOOTER_REVEAL_DELAY;
  const mountainDuration = reduceMotion ? 0 : DUR_FOOTER_MOUNTAIN_ENTER;
  const wordmarkDuration = reduceMotion ? 0 : DUR_FOOTER_WORDMARK_ENTER;
  const mountainExitDuration = reduceMotion ? 0 : DUR_FOOTER_MOUNTAIN_EXIT;
  const wordmarkExitDuration = reduceMotion ? 0 : DUR_FOOTER_WORDMARK_EXIT;
  const exitDuration = reduceMotion ? 0 : DUR_FOOTER_EXIT;
  const mountainVisible = readyToReveal && !footerExitPending;
  const wordmarkVisible = readyToReveal && !footerExitPending;

  return (
    <AnimatePresence>
      {detailsMounted && (
        <motion.div
          aria-hidden="true"
          inert
          initial={{ opacity: 0 }}
          animate={{
            opacity: targetExpanded ? 1 : 0,
            transition: {
              duration: targetExpanded ? 0 : exitDuration,
              ease: targetExpanded ? EASE_OUT : EASE_IN,
            },
          }}
          exit={{
            opacity: 0,
            transition: { duration: exitDuration, ease: EASE_IN },
          }}
          className="pointer-events-none absolute bottom-[-6.1979167vw] left-1/2 z-0 w-screen -translate-x-1/2 overflow-hidden"
          style={{ aspectRatio: '1920 / 547' }}
        >
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 48 }}
            animate={{
              opacity: mountainVisible ? 1 : 0,
              y: mountainVisible || reduceMotion ? 0 : 48,
              transition: {
                duration: footerExitPending
                  ? mountainExitDuration
                  : mountainVisible
                    ? mountainDuration
                    : exitDuration,
                delay: footerExitPending
                  ? wordmarkExitDuration
                  : mountainVisible
                    ? revealDelay
                    : 0,
                ease:
                  mountainVisible && !footerExitPending ? EASE_OUT : EASE_IN,
              },
            }}
            className="absolute inset-x-0 top-0 h-[78.24497%] w-full"
          >
            <ShaderBoundary>
              <HalftoneDots
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-full w-full"
                image="/images/jerry-zhang-mountains.png"
                colorFront={withAlpha(accentColor, 0.5)}
                colorBack="#00000000"
                contrast={0.4}
                originalColors={false}
                inverted={false}
                grid="hex"
                radius={1.25}
                size={0.1}
                scale={1}
                grainMixer={0}
                grainOverlay={0}
                grainSize={0.5}
                type="classic"
                fit="cover"
              />
            </ShaderBoundary>
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: reduceMotion ? 0 : 48 }}
            animate={{
              opacity: wordmarkVisible ? 1 : 0,
              y: wordmarkVisible || reduceMotion ? 0 : 48,
              transition: {
                duration: footerExitPending
                  ? wordmarkExitDuration
                  : wordmarkVisible
                    ? wordmarkDuration
                    : exitDuration,
                delay: wordmarkVisible ? revealDelay + mountainDuration : 0,
                ease:
                  wordmarkVisible && !footerExitPending ? EASE_OUT : EASE_IN,
              },
            }}
            className="absolute top-[35.6481%] left-0 w-full text-center font-sans leading-none font-semibold text-transparent select-none"
            style={{
              color: 'transparent',
              fontSize: '20.4167vw',
              lineHeight: '20.2083vw',
              WebkitTextStroke: `0.416667vw ${accentColor}`,
            }}
          >
            ZEUSGMJ
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
