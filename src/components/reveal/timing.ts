export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN = [0.55, 0, 1, 0.45] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DUR_MICRO = 0.14;
export const DUR_ITEM = 0.24;
export const DUR_LAYOUT = 0.26;
export const DUR_CARD_ENTER = 0.26;
export const DUR_CARD_EXIT = 0.1;
export const DUR_NAMEPLATE_ENTER = 0.6;
export const DUR_PROFILE_SETTLE = 0.32;
export const DUR_FOOTER_MOUNTAIN_ENTER = 0.28;
export const DUR_FOOTER_WORDMARK_ENTER = 0.24;
export const DUR_FOOTER_MOUNTAIN_EXIT = 0.24;
export const DUR_FOOTER_WORDMARK_EXIT = 0.2;
export const DUR_FOOTER_EXIT = 0.1;

export const LAYOUT_TRANSITION = { duration: DUR_LAYOUT, ease: EASE_OUT };
export const PROFILE_COMPACT_TRANSITION = {
  type: 'spring' as const,
  duration: 0.28,
  bounce: 0.1,
};
export const PROFILE_SETTLE_TRANSITION = {
  type: 'spring' as const,
  duration: DUR_PROFILE_SETTLE,
  bounce: 0.12,
};
export const SHELL_SETTLE_DELAY = DUR_PROFILE_SETTLE / 2;
export const FOOTER_REVEAL_DELAY = SHELL_SETTLE_DELAY + DUR_PROFILE_SETTLE;
export const FOOTER_COLLAPSE_PRELUDE_DELAY =
  DUR_FOOTER_WORDMARK_EXIT + DUR_FOOTER_MOUNTAIN_EXIT;

export interface CardWave {
  delay: number;
  from: { x?: number; y?: number };
}

export const CARD_WAVES: Record<
  'column' | 'tracks' | 'games' | 'media',
  CardWave
> = {
  column: { delay: 0.06, from: { x: -64 } },
  tracks: { delay: 0.06, from: { y: -48 } },
  games: { delay: 0.11, from: { y: -48 } },
  media: { delay: 0.16, from: { x: -56, y: -40 } },
};

export const MOBILE_CARD_WAVES: Record<
  'column' | 'tracks' | 'games' | 'media',
  CardWave
> = {
  column: { delay: CARD_WAVES.column.delay, from: { y: -48 } },
  tracks: { delay: CARD_WAVES.tracks.delay, from: { y: -48 } },
  games: { delay: CARD_WAVES.games.delay, from: { y: -48 } },
  media: { delay: CARD_WAVES.media.delay, from: { y: -48 } },
};

export const GRID_ID = 'reveal-grid';
