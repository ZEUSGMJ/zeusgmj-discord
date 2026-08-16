import 'client-only'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { NormalizedPresence } from '@/lib/lanyard.shared'
import { normalizeLanyard } from '@/lib/lanyard.shared'
import type { SpotifyCurrentTrack, SpotifyRecentTrack } from '@/lib/spotify.shared'

export type LoadState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'loaded'; presence: NormalizedPresence; currentTrack: SpotifyCurrentTrack | SpotifyRecentTrack | null; isRecentlyPlayed: boolean }

type SpotifyFallbackState = {
  track: SpotifyCurrentTrack | SpotifyRecentTrack | null
  isRecentlyPlayed: boolean
  checkedAt: number
}

const CURRENT_TRACK_TTL_MS = 30_000
const RECENT_TRACK_TTL_MS = 10 * 60_000
const MAX_RETRIES = 5
const MAX_RETRY_DELAY_MS = 30_000

async function fetchCurrentlyPlaying(): Promise<SpotifyCurrentTrack | null> {
  const res = await fetch('/api/spotify/now-playing')
  if (res.status === 204) return null
  if (!res.ok) return null
  return res.json() as Promise<SpotifyCurrentTrack>
}

async function fetchRecentlyPlayed(): Promise<SpotifyRecentTrack[]> {
  const res = await fetch('/api/spotify/recently-played')
  if (!res.ok) return []
  return res.json() as Promise<SpotifyRecentTrack[]>
}

export function useLanyardPresence(userId: string | undefined): LoadState {
  const [state, setState] = useState<LoadState>(
    userId ? { phase: 'loading' } : { phase: 'error', message: 'No Discord user ID configured' }
  )
  const spotifyFallbackRef = useRef<SpotifyFallbackState | null>(null)
  const spotifyFallbackPromiseRef = useRef<Promise<SpotifyFallbackState> | null>(null)

  const resolveSpotifyFallback = useEffectEvent(async (): Promise<SpotifyFallbackState> => {
    const cachedFallback = spotifyFallbackRef.current
    const now = Date.now()

    if (cachedFallback) {
      const maxAge = cachedFallback.isRecentlyPlayed ? RECENT_TRACK_TTL_MS : CURRENT_TRACK_TTL_MS
      if (now - cachedFallback.checkedAt < maxAge) {
        return cachedFallback
      }
    }

    if (spotifyFallbackPromiseRef.current) {
      return spotifyFallbackPromiseRef.current
    }

    spotifyFallbackPromiseRef.current = (async () => {
      const currentlyPlaying = await fetchCurrentlyPlaying()

      if (currentlyPlaying) {
        const nextFallback = {
          track: currentlyPlaying,
          isRecentlyPlayed: false,
          checkedAt: Date.now(),
        }
        spotifyFallbackRef.current = nextFallback
        return nextFallback
      }

      const canReuseRecentFallback =
        cachedFallback?.isRecentlyPlayed &&
        now - cachedFallback.checkedAt < RECENT_TRACK_TTL_MS

      if (canReuseRecentFallback) {
        const nextFallback = {
          ...cachedFallback,
          checkedAt: Date.now(),
        }
        spotifyFallbackRef.current = nextFallback
        return nextFallback
      }

      const recentTracks = await fetchRecentlyPlayed()
      const track =
        recentTracks.length > 0
          ? recentTracks[Math.floor(Math.random() * recentTracks.length)]
          : null

      const nextFallback = {
        track,
        isRecentlyPlayed: track !== null,
        checkedAt: Date.now(),
      }
      spotifyFallbackRef.current = nextFallback
      return nextFallback
    })()

    try {
      return await spotifyFallbackPromiseRef.current
    } finally {
      spotifyFallbackPromiseRef.current = null
    }
  })

  useEffect(() => {
    if (!userId) return

    let destroyed = false
    let attempt = 0
    let retryTimer: ReturnType<typeof setTimeout>
    let heartbeat: ReturnType<typeof setInterval>
    let activeWs: WebSocket

    function connect() {
      const ws = new WebSocket('wss://api.lanyard.rest/socket')
      activeWs = ws

      ws.onmessage = async (event) => {
        const { op, d, t } = JSON.parse(event.data as string) as {
          op: number
          d: Record<string, unknown>
          t?: string
        }

        if (op === 1) {
          heartbeat = setInterval(
            () => ws.send(JSON.stringify({ op: 3 })),
            (d as { heartbeat_interval: number }).heartbeat_interval,
          )
          ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }))
          attempt = 0
        }

        if (op === 0 && (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE')) {
          const presence = normalizeLanyard(d as unknown as Parameters<typeof normalizeLanyard>[0])

          if (presence.listeningToSpotify) {
            setState({ phase: 'loaded', presence, currentTrack: null, isRecentlyPlayed: false })
            return
          }

          const fallback = await resolveSpotifyFallback()
          setState({
            phase: 'loaded',
            presence,
            currentTrack: fallback.track,
            isRecentlyPlayed: fallback.isRecentlyPlayed,
          })
        }
      }

      ws.onerror = () => {}

      ws.onclose = () => {
        clearInterval(heartbeat)
        if (destroyed) return

        if (attempt >= MAX_RETRIES) {
          setState({ phase: 'error', message: 'WebSocket error' })
          return
        }

        const delay = Math.min(1000 * Math.pow(2, attempt), MAX_RETRY_DELAY_MS)
        attempt++
        retryTimer = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      destroyed = true
      clearTimeout(retryTimer)
      clearInterval(heartbeat)
      activeWs?.close()
    }
  }, [userId])

  return state
}
