export const USER_FLAGS = {
  STAFF: 1 << 0,
  PARTNER: 1 << 1,
  HYPESQUAD: 1 << 2,
  BUG_HUNTER_LEVEL_1: 1 << 3,
  HYPESQUAD_BRAVERY: 1 << 6,
  HYPESQUAD_BRILLIANCE: 1 << 7,
  HYPESQUAD_BALANCE: 1 << 8,
  PREMIUM_EARLY_SUPPORTER: 1 << 9,
  BUG_HUNTER_LEVEL_2: 1 << 14,
  VERIFIED_DEVELOPER: 1 << 17,
  CERTIFIED_MODERATOR: 1 << 18,
} as const

export interface DiscordUser {
  id: string
  username: string
  display_name: string | null
  global_name: string | null
  avatar: string | null
  discriminator: string
  public_flags: number
  banner: string | null
  banner_color: string | null
  avatar_decoration_data: { asset: string; sku_id: string } | null
  primary_guild: {
    badge: string
    tag: string
    identity_guild_id: string
    identity_enabled: boolean
  } | null
  collectibles: {
    nameplate: {
      asset: string
      palette: string
      sku_id: string
      label: string
      expires_at: string | null
    } | null
  } | null
  display_name_styles: { colors: number[]; effect_id: number; font_id: number } | null
}

export interface SpotifyTrack {
  song: string
  artist: string
  album: string
  album_art_url: string | null
  track_id: string | null
  timestamps: { start: number; end: number } | null
}

export interface Activity {
  id: string
  name: string
  type: number
  state: string | null
  details: string | null
  timestamps: { start?: number; end?: number } | null
  assets: {
    large_image: string | null
    large_text: string | null
    small_image: string | null
    small_text: string | null
  } | null
  application_id: string | null
  created_at: number
  emoji: { id: string | null; name: string; animated: boolean } | null
}

export interface LanyardData {
  discord_user: DiscordUser
  discord_status: 'online' | 'idle' | 'dnd' | 'offline'
  activities: Activity[]
  listening_to_spotify: boolean
  spotify: SpotifyTrack | null
  kv: Record<string, string>
  active_on_discord_desktop: boolean
  active_on_discord_mobile: boolean
  active_on_discord_web: boolean
  active_on_discord_embedded: boolean
  active_on_discord_vr: boolean
}

export interface NormalizedActivity {
  name: string
  details: string | null
  state: string | null
  largeImageUrl: string | null
  largeText: string | null
  smallImageUrl: string | null
  smallText: string | null
}

export interface NormalizedPresence {
  status: LanyardData['discord_status']
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl: string
    bannerUrl: string | null
    bannerColor: string | null
    avatarDecorationUrl: string | null
    publicFlags: number
  }
  activities: NormalizedActivity[]
  customStatus: { emojiUrl: string | null; emojiName: string | null; text: string | null } | null
  primaryGuild: { tag: string; badgeUrl: string | null } | null
  spotify: SpotifyTrack | null
  listeningToSpotify: boolean
  platforms: { desktop: boolean; mobile: boolean; web: boolean }
}

function resolveAssetUrl(assetKey: string, appId: string): string {
  if (assetKey.startsWith('mp:external/')) {
    return `https://media.discordapp.net/external/${assetKey.slice('mp:external/'.length)}`
  }

  if (assetKey.startsWith('spotify:')) {
    return `https://i.scdn.co/image/${assetKey.slice('spotify:'.length)}`
  }

  return `https://cdn.discordapp.com/app-assets/${appId}/${assetKey}.webp?size=128`
}

export function normalizeLanyard(data: LanyardData): NormalizedPresence {
  const { discord_user, discord_status, activities, spotify, listening_to_spotify } = data

  const avatarUrl = discord_user.avatar
    ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=256${discord_user.avatar.startsWith('a_') ? '&animated=true' : ''}`
    : `https://cdn.discordapp.com/embed/avatars/${
        discord_user.discriminator === '0'
          ? 0
          : parseInt(discord_user.discriminator, 10) % 5
      }.png`

  const bannerUrl = discord_user.banner
    ? `https://cdn.discordapp.com/banners/${discord_user.id}/${discord_user.banner}.webp?size=480${discord_user.banner.startsWith('a_') ? '&animated=true' : ''}`
    : null

  const avatarDecorationUrl = discord_user.avatar_decoration_data
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${discord_user.avatar_decoration_data.asset}.png`
    : null

  const normalizedActivities: NormalizedActivity[] = activities
    .filter((activity) => activity.type === 0 && activity.application_id !== null)
    .map((activity) => {
      const appId = activity.application_id!
      const assetKey = activity.assets?.large_image ?? null
      const smallKey = activity.assets?.small_image ?? null

      return {
        name: activity.name,
        details: activity.details ?? null,
        state: activity.state ?? null,
        largeImageUrl: assetKey ? resolveAssetUrl(assetKey, appId) : null,
        largeText: activity.assets?.large_text ?? null,
        smallImageUrl: smallKey ? resolveAssetUrl(smallKey, appId) : null,
        smallText: activity.assets?.small_text ?? null,
      }
    })

  const customActivity = activities.find((activity) => activity.type === 4) ?? null
  let customStatus: NormalizedPresence['customStatus'] = null

  if (customActivity) {
    const emoji = customActivity.emoji ?? null
    customStatus = {
      emojiUrl: emoji?.id
        ? `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'webp'}?size=32`
        : null,
      emojiName: emoji?.name ?? null,
      text: customActivity.state ?? null,
    }
  }

  const primaryGuild = discord_user.primary_guild
    ? {
        tag: discord_user.primary_guild.tag,
        badgeUrl: discord_user.primary_guild.badge
          ? `https://cdn.discordapp.com/guild-tag-badges/${discord_user.primary_guild.identity_guild_id}/${discord_user.primary_guild.badge}.webp?size=32`
          : null,
      }
    : null

  return {
    status: discord_status,
    user: {
      id: discord_user.id,
      username: discord_user.username,
      displayName: discord_user.display_name ?? discord_user.global_name ?? discord_user.username,
      avatarUrl,
      bannerUrl,
      bannerColor: discord_user.banner_color ?? null,
      avatarDecorationUrl,
      publicFlags: discord_user.public_flags,
    },
    activities: normalizedActivities,
    customStatus,
    primaryGuild,
    spotify: listening_to_spotify ? spotify : null,
    listeningToSpotify: listening_to_spotify,
    platforms: {
      desktop: data.active_on_discord_desktop,
      mobile: data.active_on_discord_mobile,
      web: data.active_on_discord_web,
    },
  }
}
