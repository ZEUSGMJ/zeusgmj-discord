'use client'

import Image from 'next/image'
import { UserRoundSearch } from 'lucide-react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { DiscordProfileData } from '@/lib/discord-profile.shared'
import { intToHex } from '@/lib/discord-profile.shared'
import type { NormalizedPresence, SpotifyTrack } from '@/lib/lanyard.shared'
import { normalizeLanyard, USER_FLAGS } from '@/lib/lanyard.shared'
import type { SpotifyCurrentTrack, SpotifyRecentTrack } from '@/lib/spotify.shared'
import StatusDot from '@/components/ui/status-dot'
import ActivityCarousel from '@/components/ui/activity-carousel'
import DiscordBadge from '@/components/ui/discord-badge'
import type { CarouselItem, SpotifyDisplay } from '@/components/ui/activity-row'

type LoadState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'loaded'; presence: NormalizedPresence; currentTrack: SpotifyCurrentTrack | SpotifyRecentTrack | null; isRecentlyPlayed: boolean }

type SpotifyFallbackState = {
  track: SpotifyCurrentTrack | SpotifyRecentTrack | null
  isRecentlyPlayed: boolean
  checkedAt: number
}

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

const statusLabel: Record<NormalizedPresence['status'], string> = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline',
}

const statusBadge: Record<NormalizedPresence['status'], string> = {
  online: 'bg-green-950/60 text-green-400',
  idle: 'bg-yellow-950/60 text-yellow-400',
  dnd: 'bg-red-950/60 text-red-400',
  offline: 'bg-zinc-800 text-zinc-500',
}

const TAGLINE = 'building things on the internet'

const BADGE_LABEL: Record<string, string> = {
  STAFF: 'Discord Staff',
  PARTNER: 'Partner',
  HYPESQUAD: 'HypeSquad Events',
  BUG_HUNTER_LEVEL_1: 'Bug Hunter',
  HYPESQUAD_BRAVERY: 'Bravery',
  HYPESQUAD_BRILLIANCE: 'Brilliance',
  HYPESQUAD_BALANCE: 'Balance',
  PREMIUM_EARLY_SUPPORTER: 'Early Supporter',
  BUG_HUNTER_LEVEL_2: 'Bug Hunter Gold',
  VERIFIED_DEVELOPER: 'Verified Developer',
  CERTIFIED_MODERATOR: 'Moderator Alumni',
}

function normalizeSpotify(track: SpotifyTrack | SpotifyCurrentTrack | SpotifyRecentTrack): SpotifyDisplay {
  if ('song' in track) {
    return {
      songTitle: track.song,
      artistLine: track.artist,
      artUrl: track.album_art_url,
      albumTitle: track.album,
      timestamps: track.timestamps,
    }
  }
  return {
    songTitle: track.name,
    artistLine: track.artists.join(', '),
    artUrl: track.albumArtUrl,
    albumTitle: track.albumName,
    timestamps: null,
  }
}

const DISCORD_USER_ID = process.env.NEXT_PUBLIC_DISCORD_USER_ID

export default function ProfilePresenceCard() {
  const [state, setState] = useState<LoadState>(
    DISCORD_USER_ID
      ? { phase: 'loading' }
      : { phase: 'error', message: 'No Discord user ID configured' }
  )
  const [discordProfile, setDiscordProfile] = useState<DiscordProfileData | null>(null)
  const spotifyFallbackRef = useRef<SpotifyFallbackState | null>(null)
  const spotifyFallbackPromiseRef = useRef<Promise<SpotifyFallbackState> | null>(null)

  const resolveSpotifyFallback = useEffectEvent(async (): Promise<SpotifyFallbackState> => {
    const cachedFallback = spotifyFallbackRef.current
    const now = Date.now()

    if (cachedFallback) {
      const maxAge = cachedFallback.isRecentlyPlayed ? 10 * 60_000 : 30_000
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
        now - cachedFallback.checkedAt < 10 * 60_000

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
    fetch('/api/discord-profile')
      .then((r) => r.ok ? r.json() as Promise<DiscordProfileData> : null)
      .then((data) => setDiscordProfile(data))
      .catch(() => {})
  }, [])

  const themeColor1ForCss = discordProfile?.themeColors ? intToHex(discordProfile.themeColors[0]) : null
  const themeColor2ForCss = discordProfile?.themeColors ? intToHex(discordProfile.themeColors[1]) : null

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--theme-primary',
      themeColor1ForCss ?? 'rgba(255,255,255,0.06)'
    )
    document.documentElement.style.setProperty(
      '--theme-accent',
      themeColor2ForCss ?? 'rgba(255,255,255,0.06)'
    )
    document.documentElement.style.setProperty(
      '--theme-page-accent',
      themeColor1ForCss ?? 'var(--color-background)'
    )
  }, [themeColor1ForCss, themeColor2ForCss])

  useEffect(() => {
    if (!DISCORD_USER_ID) return

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
          ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_USER_ID } }))
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

        const MAX_RETRIES = 5
        if (attempt >= MAX_RETRIES) {
          setState({ phase: 'error', message: 'WebSocket error' })
          return
        }

        const delay = Math.min(1000 * Math.pow(2, attempt), 30_000)
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
  }, [])

  if (state.phase === 'loading') {
    return (
      <div className="h-full rounded-3xl bg-zinc-900 overflow-hidden animate-pulse">
        <div className="h-20 bg-zinc-800" />
        <div className="px-6 pb-6">
          <div className="-mt-8 mb-4 flex items-end gap-3">
            <div className="w-16 h-16 rounded-full bg-zinc-700 ring-4 ring-zinc-900 shrink-0" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-36 rounded bg-zinc-800" />
            <div className="h-3 w-24 rounded bg-zinc-800" />
          </div>
        </div>
      </div>
    )
  }

  if (state.phase === 'error') {
    return (
      <div className="h-full min-h-52 rounded-3xl bg-zinc-900 p-6 flex items-center justify-center">
        <p className="text-sm text-zinc-600">Could not load presence data</p>
      </div>
    )
  }

  const { presence, currentTrack, isRecentlyPlayed } = state
  const spotifySource = presence.spotify ?? currentTrack
  const fromApi = !presence.listeningToSpotify && currentTrack !== null
  const spotify = spotifySource ? normalizeSpotify(spotifySource) : null

  const themeColor1 = discordProfile?.themeColors ? intToHex(discordProfile.themeColors[0]) : null
  const themeColor2 = discordProfile?.themeColors ? intToHex(discordProfile.themeColors[1]) : null

  const dcdnBannerHash = discordProfile?.bannerHash ?? null
  const bannerUrl = presence.user.bannerUrl
    ?? (dcdnBannerHash
      ? `https://cdn.discordapp.com/banners/${presence.user.id}/${dcdnBannerHash}.webp?size=2048${dcdnBannerHash.startsWith('a_') ? '&animated=true' : ''}`
      : null)

  // Always applied as the card background — theme colors take priority, then banner color,
  // then hardcoded fallback. Banner image renders on top; dcdn failure is handled by the fallback chain.
  const cardBackground = themeColor1 && themeColor2
    ? { background: `linear-gradient(to bottom, ${themeColor1}, ${themeColor2})` }
    : presence.user.bannerColor
      ? { background: `linear-gradient(to bottom, ${presence.user.bannerColor}, #09090b)` }
      : { background: 'linear-gradient(to bottom, #1e1b4b, #09090b)' }

  const bio = discordProfile?.bio ?? TAGLINE

  const carouselItems: CarouselItem[] = [
    ...presence.activities.map((a): CarouselItem => ({ kind: 'activity', data: a })),
    ...(spotify ? [{ kind: 'spotify' as const, data: spotify, fromApi, isRecentlyPlayed }] : []),
  ]

  return (
    <div
      className="h-full rounded-3xl overflow-hidden relative"
      style={cardBackground}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl border-r-2 border-b-2 border-transparent opacity-70" aria-hidden={true}/>
      {bannerUrl ? (
        <div className="relative min-h-52 w-full overflow-hidden bg-black/10">
          <Image
            src={bannerUrl}
            alt="Discord banner"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover object-center"
            preload
            unoptimized={bannerUrl.includes('animated=true')}
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/40" />
        </div>
      ) : (
        <div className="min-h-52 w-full" />
      )}

      <div className="px-6 pb-6 flex flex-col gap-4">
        <div className="-mt-16 flex items-end justify-between">
          <div className="relative size-32 shrink-0">
            <Image
              src={presence.user.avatarUrl}
              alt={presence.user.displayName}
              width={512}
              height={512}
              className="relative z-10 size-32 rounded-full ring-8 ring-zinc-900"
              preload
              unoptimized={presence.user.avatarUrl.includes('animated=true')}
            />
            {presence.user.avatarDecorationUrl && (
              <div className="pointer-events-none absolute -inset-4 z-20">
                <Image
                  src={presence.user.avatarDecorationUrl}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-contain"
                  aria-hidden={true}
                />
              </div>
            )}
            <div className="absolute bottom-0.5 right-0.5 z-30">
              <StatusDot status={presence.status} size="xl" />
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[presence.status]}`}>
            {statusLabel[presence.status]}
          </span>
        </div>

        <div className="flex gap-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-1 flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-zinc-50 leading-tight">
                  {presence.user.displayName}
                </h2>
                {presence.primaryGuild && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800/80 text-xs font-black text-zinc-400 tracking-widest mt-1">
                    {presence.primaryGuild.badgeUrl && (
                      <Image
                        src={presence.primaryGuild.badgeUrl}
                        alt=""
                        width={12}
                        height={12}
                        className="w-3 h-3 rounded-sm"
                        aria-hidden
                      />
                    )}
                    {presence.primaryGuild.tag}
                  </span>
                )}
                {discordProfile?.badges && discordProfile.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {discordProfile.badges.map((badge) => (
                      <DiscordBadge key={badge.id} badge={badge} />
                    ))}
                  </div>
                ) : (
                  (() => {
                    const textBadges = Object.entries(USER_FLAGS)
                      .filter(([, bit]) => presence.user.publicFlags & bit)
                      .map(([name]) => BADGE_LABEL[name])
                      .filter(Boolean)
                    return textBadges.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {textBadges.map((label) => (
                          <span
                            key={label}
                            className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-[10px] text-zinc-400 font-medium"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : null
                  })()
                )}
              </div>
              <p className="text-sm text-zinc-500">@{presence.user.username}</p>
            </div>
            <a
              href={`https://discord.com/users/${DISCORD_USER_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80 mt-0.5"
              style={{ backgroundColor: themeColor2ForCss ? `${themeColor2ForCss}99` : '#27272a' }}
            >
              <UserRoundSearch className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View User</span>
            </a>
          </div>
          {presence.customStatus && (presence.customStatus.text ?? presence.customStatus.emojiName) && (
            <div className='bg-zinc-900 px-2 py-1 rounded-xl max-w-max shadow-lg my-1'>
              <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                {presence.customStatus.emojiUrl ? (
                  <Image
                    src={presence.customStatus.emojiUrl}
                    alt={presence.customStatus.emojiName ?? ''}
                    width={24}
                    height={24}
                    className="w-6 h-6 shrink-0"
                    loading='lazy'
                    unoptimized
                  />
                ) : presence.customStatus.emojiName ? (
                  <span>{presence.customStatus.emojiName}</span>
                ) : null}
                {presence.customStatus.text && (
                  <span className="italic text-sm">{presence.customStatus.text}</span>
                )}
              </p>
            </div>
          )}

          <p className="text-sm text-zinc-400 mt-1">{bio}</p>
        </div>

        <div className="border-t border-zinc-800/60" />

        {carouselItems.length === 0 ? (
          <p className="text-sm text-zinc-600 italic">No active activity</p>
        ) : (
          <ActivityCarousel items={carouselItems} />
        )}
      </div>
    </div>
  )
}
