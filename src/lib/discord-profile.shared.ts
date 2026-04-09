export interface DiscordProfileBadge {
  id: string
  description: string
  icon: string
  link?: string
}

export interface DiscordProfileData {
  badges: DiscordProfileBadge[]
  themeColors: [number, number] | null
  accentColor: number | null
  bio: string | null
  bannerHash: string | null
}

export function intToHex(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`
}
