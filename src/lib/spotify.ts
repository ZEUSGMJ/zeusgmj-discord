import 'server-only'

import type {
  SpotifyCurrentTrack,
  SpotifyRecentTrack,
  SpotifyResult,
  SpotifyTopTrack,
} from '@/lib/spotify.shared'

const MOCK_TRACKS: SpotifyTopTrack[] = [
  {
    id: 'mock-1',
    name: 'Redbone',
    artists: ['Childish Gambino'],
    albumName: '"Awaken, My Love!"',
    albumArtUrl: null,
    externalUrl: 'https://open.spotify.com',
  },
  {
    id: 'mock-2',
    name: 'Midnight City',
    artists: ['M83'],
    albumName: "Hurry Up, We're Dreaming",
    albumArtUrl: null,
    externalUrl: 'https://open.spotify.com',
  },
  {
    id: 'mock-3',
    name: 'The Less I Know the Better',
    artists: ['Tame Impala'],
    albumName: 'Currents',
    albumArtUrl: null,
    externalUrl: 'https://open.spotify.com',
  },
]

let tokenCache: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_SECRET_ID
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify env vars')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Spotify token refresh failed: ${res.status}`)
  const data = await res.json()
  const expiresIn: number = (data.expires_in as number) ?? 3600
  tokenCache = { token: data.access_token as string, expiresAt: Date.now() + expiresIn * 1000 - 60_000 }
  return tokenCache.token
}

export async function getTopTracks(): Promise<SpotifyResult> {
  if (!process.env.SPOTIFY_CLIENT_ID) {
    return { tracks: MOCK_TRACKS }
  }

  try {
    const token = await getAccessToken()
    const res = await fetch(
      'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=6',
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      },
    )
    if (!res.ok) throw new Error(`Spotify top tracks failed: ${res.status}`)

    const data = await res.json()
    const tracks: SpotifyTopTrack[] = (data.items ?? []).map((item: Record<string, unknown>) => {
      const album = item.album as Record<string, unknown>
      const images = album.images as Array<{ url: string }> | undefined
      const artists = item.artists as Array<{ name: string }>
      const externalUrls = item.external_urls as Record<string, string> | undefined
      return {
        id: item.id as string,
        name: item.name as string,
        artists: artists.map((a) => a.name),
        albumName: album.name as string,
        albumArtUrl: images?.[0]?.url ?? null,
        externalUrl: externalUrls?.spotify ?? `https://open.spotify.com/track/${item.id}`,
      }
    })

    return { tracks }
  } catch (err) {
    console.error('[spotify] getTopTracks error:', err)
    return { tracks: MOCK_TRACKS, error: 'Failed to load' }
  }
}

export async function getRecentlyPlayed(): Promise<SpotifyRecentTrack[]> {
  if (!process.env.SPOTIFY_CLIENT_ID) return []

  try {
    const token = await getAccessToken()
    const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 21600 },
    })
    if (!res.ok) throw new Error(`Spotify recently-played failed: ${res.status}`)

    const data = await res.json()
    const items: SpotifyRecentTrack[] = ((data.items ?? []) as Array<Record<string, unknown>>)
      .filter((item) => {
        const track = item.track as Record<string, unknown> | null
        return track && (track.type as string) === 'track'
      })
      .map((item) => {
        const track = item.track as Record<string, unknown>
        const album = track.album as Record<string, unknown>
        const images = album.images as Array<{ url: string }> | undefined
        const artists = track.artists as Array<{ name: string }>
        const externalUrls = track.external_urls as Record<string, string> | undefined
        return {
          name: track.name as string,
          artists: artists.map((a) => a.name),
          albumName: album.name as string,
          albumArtUrl: images?.[0]?.url ?? null,
          externalUrl: externalUrls?.spotify ?? 'https://open.spotify.com',
        }
      })

    return items
  } catch (err) {
    console.error('[spotify] getRecentlyPlayed error:', err)
    return []
  }
}

export async function getCurrentlyPlaying(): Promise<SpotifyCurrentTrack | null> {
  if (!process.env.SPOTIFY_CLIENT_ID) return null

  try {
    const token = await getAccessToken()
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (res.status === 204) return null
    if (!res.ok) throw new Error(`Spotify currently-playing failed: ${res.status}`)

    const data = await res.json()

    if (data.currently_playing_type !== 'track' || !data.item) return null
    if (!data.is_playing) return null

    const item = data.item as Record<string, unknown>
    const album = item.album as Record<string, unknown>
    const images = album.images as Array<{ url: string }> | undefined
    const artists = item.artists as Array<{ name: string }>
    const externalUrls = item.external_urls as Record<string, string> | undefined

    return {
      name: item.name as string,
      artists: artists.map((a) => a.name),
      albumName: album.name as string,
      albumArtUrl: images?.[0]?.url ?? null,
      externalUrl: externalUrls?.spotify ?? 'https://open.spotify.com',
      isPlaying: data.is_playing as boolean,
    }
  } catch (err) {
    console.error('[spotify] getCurrentlyPlaying error:', err)
    return null
  }
}
