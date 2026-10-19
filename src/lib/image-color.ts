import 'server-only';

import { unstable_cache } from 'next/cache';
import sharp from 'sharp';

const FETCH_TIMEOUT_MS = 2500;
const SAMPLE_SIZE = 16;
const HUE_BUCKETS = 12;
const MIN_LIGHTNESS = 0.12;
const MAX_LIGHTNESS = 0.92;
const MIN_CHROMA = 0.08;
const REVALIDATE_SECONDS = 3600;

interface Bucket {
  weight: number;
  r: number;
  g: number;
  b: number;
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

function pickDominant(pixels: Buffer, channels: number): string | null {
  const buckets: Bucket[] = Array.from({ length: HUE_BUCKETS }, () => ({
    weight: 0,
    r: 0,
    g: 0,
    b: 0,
  }));
  const neutral: Bucket = { weight: 0, r: 0, g: 0, b: 0 };

  for (let i = 0; i + 2 < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const lightness = (max + min) / 2;
    if (lightness < MIN_LIGHTNESS || lightness > MAX_LIGHTNESS) continue;

    const chroma = max - min;
    if (chroma < MIN_CHROMA) {
      neutral.weight += 1;
      neutral.r += r;
      neutral.g += g;
      neutral.b += b;
      continue;
    }

    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    let hue: number;
    if (max === rn) hue = (((gn - bn) / chroma) % 6) * 60;
    else if (max === gn) hue = ((bn - rn) / chroma + 2) * 60;
    else hue = ((rn - gn) / chroma + 4) * 60;

    const bucket =
      buckets[Math.floor(((hue + 360) % 360) / (360 / HUE_BUCKETS))];
    const weight = chroma * (1 - Math.abs(2 * lightness - 1));
    bucket.weight += weight;
    bucket.r += r * weight;
    bucket.g += g * weight;
    bucket.b += b * weight;
  }

  const best = buckets.reduce((a, b) => (b.weight > a.weight ? b : a));
  if (best.weight > 0) {
    return toHex(
      best.r / best.weight,
      best.g / best.weight,
      best.b / best.weight,
    );
  }
  if (neutral.weight > 0) {
    return toHex(
      neutral.r / neutral.weight,
      neutral.g / neutral.weight,
      neutral.b / neutral.weight,
    );
  }
  return null;
}

async function extractDominantColor(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const { data, info } = await sharp(
      Buffer.from(await response.arrayBuffer()),
    )
      .resize(SAMPLE_SIZE, SAMPLE_SIZE, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    return pickDominant(data, info.channels);
  } catch {
    return null;
  }
}

const getCachedDominantColor = unstable_cache(
  async (imageUrl: string) => extractDominantColor(imageUrl),
  ['dominant-color'],
  { revalidate: REVALIDATE_SECONDS },
);

export async function getDominantColor(
  imageUrl: string | null | undefined,
): Promise<string | null> {
  if (!imageUrl) return null;
  try {
    return await getCachedDominantColor(imageUrl);
  } catch {
    return null;
  }
}
