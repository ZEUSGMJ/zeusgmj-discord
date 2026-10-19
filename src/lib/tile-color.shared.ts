import type { CSSProperties } from 'react';
import { HEX_COLOR, capLuminance, contrastRatio } from '@/lib/contrast.shared';

export type TileKind = 'tracks' | 'games' | 'media';

export interface TileColors {
  tintStart: string;
  glow: string;
  label: string;
}

export const TILE_SURFACE = '#101216';

const FALLBACK_TINT: Record<TileKind, string> = {
  tracks: '#1b1f47',
  games: '#3a2416',
  media: '#0f3a3a',
};

const MIN_LABEL_CONTRAST = 4.5;
const NEUTRAL_SATURATION = 0.08;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const l = (max + min) / 2;

  if (chroma === 0) return [0, 0, l];

  const s = chroma / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / chroma) % 6;
  else if (max === g) h = (b - r) / chroma + 2;
  else h = (r - g) / chroma + 4;

  return [(h * 60 + 360) % 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - chroma / 2;
  const [r, g, b] =
    h < 60
      ? [chroma, x, 0]
      : h < 120
        ? [x, chroma, 0]
        : h < 180
          ? [0, chroma, x]
          : h < 240
            ? [0, x, chroma]
            : h < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];

  return `#${[r, g, b]
    .map((channel) =>
      Math.round((channel + m) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

function shapeSaturation(s: number, min: number, max: number): number {
  return s < NEUTRAL_SATURATION ? 0 : clamp(s, min, max);
}

function pickLabel(h: number, s: number, tintStart: string): string {
  const saturation = shapeSaturation(s, 0.35, 0.8);
  let lightness = 0.7;
  let label = hslToHex(h, saturation, lightness);

  while (
    lightness < 0.96 &&
    Math.min(
      contrastRatio(label, TILE_SURFACE),
      contrastRatio(label, tintStart),
    ) < MIN_LABEL_CONTRAST
  ) {
    lightness += 0.04;
    label = hslToHex(h, saturation, lightness);
  }

  return label;
}

export function deriveTileColors(
  accent: string | null | undefined,
  kind: TileKind,
): TileColors {
  const source = accent && HEX_COLOR.test(accent) ? accent : null;

  if (!source) {
    const tintStart = FALLBACK_TINT[kind];
    const [h, s] = hexToHsl(tintStart);
    return {
      tintStart,
      glow: hslToHex(h, shapeSaturation(s, 0.4, 0.9), 0.55),
      label: pickLabel(h, s, tintStart),
    };
  }

  const [h, s] = hexToHsl(source);
  const tintStart = capLuminance(
    hslToHex(h, shapeSaturation(s, 0.3, 0.7), 0.17),
  );

  return {
    tintStart,
    glow: hslToHex(h, shapeSaturation(s, 0.4, 0.9), 0.55),
    label: pickLabel(h, s, tintStart),
  };
}

export function tileStyle(colors: TileColors): CSSProperties {
  return {
    '--tile-tint': colors.tintStart,
    '--tile-glow': colors.glow,
    '--tile-label': colors.label,
  } as CSSProperties;
}
