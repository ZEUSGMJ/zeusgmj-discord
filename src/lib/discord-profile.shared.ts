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

export interface DiscordProfileData {
  badges: DiscordProfileBadge[];
  themeColors: [number, number] | null;
  bio: string | null;
  bannerHash: string | null;
  collectibles: {
    nameplate: DiscordProfileNameplate | null;
  };
}

export function intToHex(value: number): string {
  return `#${(value >>> 0).toString(16).padStart(6, '0')}`;
}
