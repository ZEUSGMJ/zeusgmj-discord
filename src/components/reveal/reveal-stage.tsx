'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import RevealCard, { type RevealCardId } from '@/components/reveal/reveal-card';
import { useReveal } from '@/components/reveal/reveal-context';
import {
  CARD_WAVES,
  GRID_ID,
  LAYOUT_TRANSITION,
  MOBILE_CARD_WAVES,
  type CardWave,
} from '@/components/reveal/timing';

interface RevealStageProps {
  presence: ReactNode;
  links: ReactNode;
  yearProgress: ReactNode;
  tracks: ReactNode;
  games: ReactNode;
  media: ReactNode;
}

const DETAIL_CARD_COUNT = 4;
function useFrozenCardWaves(generation: number) {
  const isSmOrWider = useMediaQuery('(min-width: 640px)');
  const resolvedWaves = isSmOrWider ? CARD_WAVES : MOBILE_CARD_WAVES;
  const [snapshot, setSnapshot] = useState(() => ({
    generation,
    waves: resolvedWaves,
  }));

  if (snapshot.generation !== generation) {
    setSnapshot({ generation, waves: resolvedWaves });
  }

  return snapshot.waves as Record<RevealCardId, CardWave>;
}

export default function RevealStage({
  presence,
  links,
  yearProgress,
  tracks,
  games,
  media,
}: RevealStageProps) {
  const {
    detailsMounted,
    layoutExpanded,
    targetExpanded,
    intentGeneration,
    onDetailsEnterComplete,
    onDetailsExitComplete,
  } = useReveal();
  const cardWaves = useFrozenCardWaves(intentGeneration);
  const enterProgressRef = useRef({
    generation: intentGeneration,
    cardIds: new Set<RevealCardId>(),
    reported: false,
  });

  useEffect(() => {
    enterProgressRef.current = {
      generation: intentGeneration,
      cardIds: new Set<RevealCardId>(),
      reported: false,
    };
  }, [detailsMounted, intentGeneration]);

  const handleCardEnterComplete = useCallback(
    (cardId: RevealCardId, generation: number) => {
      if (!targetExpanded || !layoutExpanded || generation !== intentGeneration)
        return;

      if (enterProgressRef.current.generation !== generation) {
        enterProgressRef.current = {
          generation,
          cardIds: new Set<RevealCardId>(),
          reported: false,
        };
      }

      const progress = enterProgressRef.current;
      if (progress.reported) return;
      progress.cardIds.add(cardId);

      if (progress.cardIds.size === DETAIL_CARD_COUNT) {
        progress.reported = true;
        onDetailsEnterComplete(generation);
      }
    },
    [intentGeneration, layoutExpanded, onDetailsEnterComplete, targetExpanded],
  );

  return (
    <motion.div
      layout="position"
      transition={LAYOUT_TRANSITION}
      id={GRID_ID}
      className={
        layoutExpanded
          ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
          : 'flex justify-center'
      }
    >
      <motion.div
        layout
        transition={LAYOUT_TRANSITION}
        className={layoutExpanded ? 'sm:col-span-2' : 'w-full max-w-md'}
      >
        {presence}
      </motion.div>

      <AnimatePresence
        mode="sync"
        initial={false}
        onExitComplete={onDetailsExitComplete}
      >
        {detailsMounted && (
          <RevealCard
            key="column"
            cardId="column"
            generation={intentGeneration}
            wave={cardWaves.column}
            className="flex h-full flex-col gap-4"
            onEnterComplete={handleCardEnterComplete}
          >
            <div>{links}</div>
            <div className="min-h-44 flex-1">{yearProgress}</div>
          </RevealCard>
        )}

        {detailsMounted && (
          <RevealCard
            key="tracks"
            cardId="tracks"
            generation={intentGeneration}
            wave={cardWaves.tracks}
            onEnterComplete={handleCardEnterComplete}
          >
            {tracks}
          </RevealCard>
        )}

        {detailsMounted && (
          <RevealCard
            key="games"
            cardId="games"
            generation={intentGeneration}
            wave={cardWaves.games}
            onEnterComplete={handleCardEnterComplete}
          >
            {games}
          </RevealCard>
        )}

        {detailsMounted && (
          <RevealCard
            key="media"
            cardId="media"
            generation={intentGeneration}
            wave={cardWaves.media}
            onEnterComplete={handleCardEnterComplete}
          >
            {media}
          </RevealCard>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
