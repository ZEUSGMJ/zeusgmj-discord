import 'server-only'

import type {
  SpotifyCurrentTrack,
  SpotifyRecentTrack,
  SpotifyResult,
  SpotifyTopTrack,
} from '@/lib/spotify.shared'
import { mapSpotifyTrack } from '@/lib/spotify.shared'
import { RETOKEND_ENABLED, getAccessToken } from '@/lib/spotify-auth'

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

export async function getTopTracks(): Promise<SpotifyResult> {
  if (!RETOKEND_ENABLED && !process.env.SPOTIFY_CLIENT_ID) {
    return { tracks: MOCK_TRACKS }
  }

  try {
    const token = await getAccessToken()
    const res = await fetch(
      'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5',
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      },
    )
    if (!res.ok) throw new Error(`Spotify top tracks failed: ${res.status}`)

    const data = await res.json()
    const tracks: SpotifyTopTrack[] = (data.items ?? []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      ...mapSpotifyTrack(item, `https://open.spotify.com/track/${item.id}`),
    }))

    return { tracks }
  } catch (err) {
    console.error('[spotify] getTopTracks error:', err)
    return { tracks: MOCK_TRACKS, error: 'Failed to load' }
  }
}

export async function getRecentlyPlayed(): Promise<SpotifyRecentTrack[]> {
  if (!RETOKEND_ENABLED && !process.env.SPOTIFY_CLIENT_ID) return []

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
      .map((item) => mapSpotifyTrack(item.track as Record<string, unknown>))

    return items
  } catch (err) {
    console.error('[spotify] getRecentlyPlayed error:', err)
    return []
  }
}

export async function getCurrentlyPlaying(): Promise<SpotifyCurrentTrack | null> {
  if (!RETOKEND_ENABLED && !process.env.SPOTIFY_CLIENT_ID) return null

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

    return mapSpotifyTrack(data.item as Record<string, unknown>)
  } catch (err) {
    console.error('[spotify] getCurrentlyPlaying error:', err)
    return null
  }
}
