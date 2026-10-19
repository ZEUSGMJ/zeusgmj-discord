export interface DiscordProfileBadge {
  id: string;
  description: string;
  icon: string;
  link?: string;
}

export type DiscordNameplatePalette =
  | 'crimson'
  | 'berry'
  | 'sky'
  | 'teal'
  | 'forest'
  | 'bubble_gum'
  | 'violet'
  | 'cobalt'
  | 'clover'
  | 'lemon'
  | 'white';

export interface DiscordProfileNameplate {
  asset: string;
  palette: DiscordNameplatePalette | null;
  label: string;
  skuId: string;
  expiresAt: string | null;
  animatedUrl: string;
  staticUrl: string;
}

export interface DisplayNameStyles {
  effectId: number;
  colors: number[];
}

export interface DiscordProfileData {
  badges: DiscordProfileBadge[];
  themeColors: [number, number] | null;
  bio: string | null;
  bannerHash: string | null;
  collectibles: {
    nameplate: DiscordProfileNameplate | null;
  };
  displayNameStyles: DisplayNameStyles | null;
}

export function normalizeDisplayNameStyles(
  value: unknown,
): DisplayNameStyles | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Record<string, unknown>;
  const effectId = raw.effect_id;
  if (typeof effectId !== 'number' || !Number.isInteger(effectId)) return null;

  const colors = Array.isArray(raw.colors)
    ? raw.colors.filter(
        (color): color is number =>
          typeof color === 'number' &&
          Number.isInteger(color) &&
          color >= 0 &&
          color <= 0xffffff,
      )
    : [];
  if (colors.length === 0) return null;

  return { effectId, colors };
}

const DISCORD_EPOCH_MS = 1420070400000;
const MEMBER_SINCE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function memberSince(userId: string): string | null {
  const createdAt = Math.floor(Number(userId) / 2 ** 22) + DISCORD_EPOCH_MS;
  if (!Number.isFinite(createdAt) || createdAt < DISCORD_EPOCH_MS) return null;
  return MEMBER_SINCE_FORMAT.format(createdAt);
}

export function intToHex(value: number): string {
  return `#${(value >>> 0).toString(16).padStart(6, '0')}`;
}
