import 'server-only'

import type { DiscordProfileData } from '@/lib/discord-profile.shared'

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
  const rawBadges: Array<{ id: string; description: string; icon: string; link?: string }> =
    json.badges ?? []

  const themeColors = Array.isArray(userProfile.theme_colors) && userProfile.theme_colors.length >= 2
    ? ([userProfile.theme_colors[0], userProfile.theme_colors[1]] as [number, number])
    : null

  return {
    badges: rawBadges.map((badge) => ({
      id: badge.id,
      description: badge.description,
      icon: badge.icon,
      link: badge.link,
    })),
    themeColors,
    accentColor: (userProfile.accent_color ?? user.accent_color) as number | null,
    bio: (userProfile.bio ?? user.bio ?? null) as string | null,
    bannerHash: (userProfile.banner ?? user.banner ?? null) as string | null,
  }
}
