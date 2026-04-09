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

    const games: SteamGame[] = rawGames.map((g) => ({
      appId: g.appid as number,
      name: g.name as string,
      playtimeForever: formatPlaytime(g.playtime_forever as number),
      playtime2Weeks: formatPlaytime((g.playtime_2weeks as number) ?? 0),
      iconUrl: g.img_icon_url
        ? `https://steamcdn-a.akamaihd.net/steam/apps/${g.appid}/library_600x900_2x.jpg`
        : null,
      storeUrl: `https://store.steampowered.com/app/${g.appid}`,
    }))

    return { games }
  } catch (err) {
    console.error('[steam] getRecentGames error:', err)
    return { games: MOCK_GAMES, error: 'Failed to load' }
  }
}
