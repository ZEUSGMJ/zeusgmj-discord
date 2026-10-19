import type { CSSProperties } from 'react';
import {
  MAX_BACKGROUND_LUMINANCE,
  hexToLuminance,
  wcagContrast,
} from '@/lib/contrast.shared';
import { intToHex, type DisplayNameStyles } from '@/lib/discord-profile.shared';

export type DisplayNameEffect =
  'solid' | 'gradient' | 'neon' | 'toon' | 'pop' | 'glow';

export interface ResolvedDisplayName {
  effect: DisplayNameEffect;
  style: CSSProperties;
}

const EFFECT_BY_ID: Record<number, DisplayNameEffect> = {
  1: 'solid',
  2: 'gradient',
  3: 'neon',
  4: 'toon',
  5: 'pop',
  6: 'glow',
};

const MIN_NAME_CONTRAST = 3;

function mix(hex: string, target: number, amount: number) {
  return `#${[1, 3, 5]
    .map((start) =>
      Math.round(
        parseInt(hex.slice(start, start + 2), 16) * (1 - amount) +
          target * amount,
      )
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

const toward = {
  white: (hex: string, amount: number) => mix(hex, 255, amount),
  black: (hex: string, amount: number) => mix(hex, 0, amount),
};

function liftToContrast(hex: string, backgroundLs: number[]): string {
  let lifted = hex;
  for (let amount = 0.05; amount <= 1; amount += 0.05) {
    const L = hexToLuminance(lifted);
    if (
      Math.min(...backgroundLs.map((bgL) => wcagContrast(L, bgL))) >=
      MIN_NAME_CONTRAST
    )
      return lifted;
    lifted = toward.white(hex, amount);
  }
  return lifted;
}

export function resolveDisplayName(
  styles: DisplayNameStyles | null | undefined,
  backgroundLs: number[] = [MAX_BACKGROUND_LUMINANCE],
): ResolvedDisplayName | null {
  if (!styles || styles.colors.length === 0) return null;

  const effect = EFFECT_BY_ID[styles.effectId] ?? 'solid';
  const base = liftToContrast(intToHex(styles.colors[0]), backgroundLs);
  const second = styles.colors[1]
    ? liftToContrast(intToHex(styles.colors[1]), backgroundLs)
    : toward.white(base, 0.55);

  return {
    effect,
    style: {
      '--dn-base': base,
      '--dn-from': base,
      '--dn-to': second,
      '--dn-light': toward.white(base, 0.82),
      '--dn-dark': toward.black(base, 0.62),
    } as CSSProperties,
  };
}
