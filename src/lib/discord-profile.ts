import 'server-only'

import type {
  DiscordNameplatePalette,
  DiscordProfileData,
  DiscordProfileNameplate,
} from '@/lib/discord-profile.shared'

const NAMEPLATE_PALETTES = new Set<DiscordNameplatePalette>([
  'crimson',
  'berry',
  'sky',
  'teal',
  'forest',
  'bubble_gum',
  'violet',
  'cobalt',
  'clover',
  'lemon',
  'white',
])

function normalizeNameplate(value: unknown): DiscordProfileNameplate | null {
  if (!value || typeof value !== 'object') return null

  const raw = value as Record<string, unknown>
  const rawAsset = typeof raw.asset === 'string' ? raw.asset.trim() : ''
  const skuId = typeof raw.sku_id === 'string' ? raw.sku_id.trim() : ''
  const asset = rawAsset.replace(/^\/+|\/+$/g, '')

  if (!asset || !skuId || asset.includes('..') || !/^[A-Za-z0-9_/-]+$/.test(asset)) return null

  const palette = typeof raw.palette === 'string' && NAMEPLATE_PALETTES.has(raw.palette as DiscordNameplatePalette)
    ? raw.palette as DiscordNameplatePalette
    : null
  const label = typeof raw.label === 'string' ? raw.label.trim() : ''
  const expiresAt = typeof raw.expires_at === 'string' && raw.expires_at.trim()
    ? raw.expires_at.trim()
    : null

  return {
    asset,
    palette,
    label,
    skuId,
    expiresAt,
    animatedUrl: `https://cdn.discordapp.com/assets/collectibles/${asset}/asset.webm`,
    staticUrl: `https://cdn.discordapp.com/assets/collectibles/${asset}/static.png`,
  }
}

export async function fetchDiscordProfile(userId: string): Promise<DiscordProfileData> {
  const response = await fetch(`https://dcdn.dstn.to/profile/${userId}`, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`dcdn fetch failed: ${response.status}`)
  }

  const json = await response.json()
  const user = json.user ?? {}
  const userProfile = json.user_profile ?? {}
  const nameplate = normalizeNameplate(
    json.user?.collectibles?.nameplate ?? json.collectibles?.nameplate
  )
  const rawBadges: Array<Record<string, unknown>> = Array.isArray(json.badges)
    ? json.badges.filter((badge: unknown): badge is Record<string, unknown> => Boolean(badge && typeof badge === 'object'))
    : []

  const themeColors = Array.isArray(userProfile.theme_colors) && userProfile.theme_colors.length >= 2
    ? ([userProfile.theme_colors[0], userProfile.theme_colors[1]] as [number, number])
    : null

  return {
    badges: rawBadges.flatMap((badge) => {
      if (typeof badge.id !== 'string' || typeof badge.description !== 'string' || typeof badge.icon !== 'string') {
        return []
      }
      return [{
        id: badge.id,
        description: badge.description,
        icon: badge.icon,
        link: typeof badge.link === 'string' ? badge.link : undefined,
      }]
    }),
    themeColors,
    bio: (userProfile.bio ?? user.bio ?? null) as string | null,
    bannerHash: (userProfile.banner ?? user.banner ?? null) as string | null,
    collectibles: { nameplate },
  }
}
