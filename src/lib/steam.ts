import 'server-only'

import { formatPlaytime } from '@/lib/utils'

export interface SteamGame {
  appId: number
  name: string
  playtimeForever: string
  playtime2Weeks: string
  iconUrl: string | null
  storeUrl: string
}

export interface SteamResult {
  games: SteamGame[]
  error?: string
}

const MOCK_GAMES: SteamGame[] = [
  {
    appId: 730,
    name: 'Counter-Strike 2',
    playtimeForever: '200h',
    playtime2Weeks: '3h',
    iconUrl: null,
    storeUrl: 'https://store.steampowered.com/app/730',
  },
  {
    appId: 570,
    name: 'Dota 2',
    playtimeForever: '80h',
    playtime2Weeks: '1h',
    iconUrl: null,
    storeUrl: 'https://store.steampowered.com/app/570',
  },
  {
    appId: 1172470,
    name: 'Apex Legends',
    playtimeForever: '40h',
    playtime2Weeks: '0m',
    iconUrl: null,
    storeUrl: 'https://store.steampowered.com/app/1172470',
  },
]

async function resolveImageUrl(appId: number): Promise<string | null> {
  const capsuleUrl = `https://shared.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`

  try {
    const probe = await fetch(capsuleUrl, {
      method: 'HEAD',
      next: { revalidate: 1800 },
    })
    if (probe.ok) return capsuleUrl
  } catch {}

  const gridDbKey = process.env.STEAMGRIDDB_API_KEY
  if (gridDbKey) {
    try {
      const res = await fetch(
        `https://www.steamgriddb.com/api/v2/grids/steam/${appId}?dimensions=600x900`,
        {
          headers: { Authorization: `Bearer ${gridDbKey}` },
          next: { revalidate: 1800 },
        },
      )
      if (res.ok) {
        const data = await res.json()
        const grids = (data?.data ?? []) as Array<{ url: string; style: string }>
        const grid = grids.find((g) => g.style === 'official') ?? grids[0]
        if (grid?.url) return grid.url
      }
    } catch {}
  }

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=basic`,
      { next: { revalidate: 1800 } },
    )
    if (!res.ok) return null
    const data = await res.json()
    const headerImage = data?.[appId]?.data?.header_image as string | undefined
    if (!headerImage) return null
    return headerImage.replace(
      /^https:\/\/shared\.(akamai|cloudflare)\.steamstatic\.com\//,
      'https://shared.steamstatic.com/',
    )
  } catch {
    return null
  }
}

export async function getRecentGames(): Promise<SteamResult> {
  const apiKey = process.env.STEAM_API_KEY
  const steamId = process.env.STEAM_ID

  if (!apiKey || !steamId) {
    return { games: MOCK_GAMES }
  }

  try {
    const url = new URL(
      'https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/',
    )
    url.searchParams.set('key', apiKey)
    url.searchParams.set('steamid', steamId)
    url.searchParams.set('count', '3')
    url.searchParams.set('format', 'json')

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } })
    if (!res.ok) throw new Error(`Steam API failed: ${res.status}`)

    const data = await res.json()
    const rawGames = (data.response?.games ?? []) as Array<Record<string, unknown>>

    const games: SteamGame[] = await Promise.all(
      rawGames.map(async (g) => ({
        appId: g.appid as number,
        name: g.name as string,
        playtimeForever: formatPlaytime(g.playtime_forever as number),
        playtime2Weeks: formatPlaytime((g.playtime_2weeks as number) ?? 0),
        iconUrl: await resolveImageUrl(g.appid as number),
        storeUrl: `https://store.steampowered.com/app/${g.appid}`,
      })),
    )

    return { games }
  } catch (err) {
    console.error('[steam] getRecentGames error:', err)
    return { games: MOCK_GAMES, error: 'Failed to load' }
  }
}
