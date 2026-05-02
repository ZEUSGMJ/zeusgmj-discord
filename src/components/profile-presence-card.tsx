'use client'

import Image from 'next/image'
import { UserRoundSearch } from 'lucide-react'
import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react'
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

type ContrastCandidate = { hex: string; L: number }
type ForegroundDirection = 'light' | 'dark'

const ZINC: ContrastCandidate[] = [
  { hex: '#fafafa', L: 0.955 },
  { hex: '#f4f4f5', L: 0.910 },
  { hex: '#e4e4e7', L: 0.796 },
  { hex: '#d4d4d8', L: 0.684 },
  { hex: '#a1a1aa', L: 0.373 },
  { hex: '#71717a', L: 0.193 },
  { hex: '#52525b', L: 0.107 },
  { hex: '#3f3f46', L: 0.066 },
  { hex: '#27272a', L: 0.031 },
  { hex: '#18181b', L: 0.014 },
  { hex: '#09090b', L: 0.003 },
]

const WHITE: ContrastCandidate = { hex: '#ffffff', L: 1 }
const BLACK: ContrastCandidate = { hex: '#000000', L: 0 }
const FALLBACK_BACKGROUND_COLORS = ['#1e1b4b', '#09090b'] as const
const HEX_COLOR = /^#[\da-f]{6}$/i

function hexToLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const lin = (c: number) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function wcagContrast(La: number, Lb: number): number {
  const [hi, lo] = La > Lb ? [La, Lb] : [Lb, La]
  return (hi + 0.05) / (lo + 0.05)
}

function minContrastAgainst(candidate: ContrastCandidate, backgroundLs: number[]): number {
  return Math.min(...backgroundLs.map((bgL) => wcagContrast(candidate.L, bgL)))
}

function bestForeground(backgroundLs: number[]): ContrastCandidate {
  return [WHITE, BLACK, ...ZINC].reduce((best, candidate) =>
    minContrastAgainst(candidate, backgroundLs) > minContrastAgainst(best, backgroundLs)
      ? candidate
      : best
  )
}

function pickForeground(
  backgroundLs: number[],
  minRatio: number,
  direction: ForegroundDirection,
  strength: 'strong' | 'subtle',
): string {
  const ordered = direction === 'light' ? ZINC : [...ZINC].reverse()
  const passing = ordered.filter((candidate) => minContrastAgainst(candidate, backgroundLs) >= minRatio)

  if (passing.length > 0) {
    return strength === 'strong' ? passing[0].hex : passing[passing.length - 1].hex
  }

  const fallback = direction === 'light' ? WHITE : BLACK
  if (minContrastAgainst(fallback, backgroundLs) >= minRatio) {
    return fallback.hex
  }

  return bestForeground(backgroundLs).hex
}

function getBackgroundColors(
  themeColor1: string | null,
  themeColor2: string | null,
  bannerColor: string | null,
): [string, string] {
  if (themeColor1 && themeColor2) return [themeColor1, themeColor2]
  if (bannerColor && HEX_COLOR.test(bannerColor)) return [bannerColor, '#09090b']
  return [...FALLBACK_BACKGROUND_COLORS]
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

  const backgroundColors = getBackgroundColors(themeColor1, themeColor2, presence.user.bannerColor)
  const cardBackground = { background: `linear-gradient(to bottom, ${backgroundColors[0]}, ${backgroundColors[1]})` }

  const backgroundLs = backgroundColors.map(hexToLuminance)
  const textDir: ForegroundDirection =
    minContrastAgainst(WHITE, backgroundLs) >= minContrastAgainst(BLACK, backgroundLs)
      ? 'light'
      : 'dark'
  const cftHi = pickForeground(backgroundLs, 4.5, textDir, 'strong')
  const cftMid = pickForeground(backgroundLs, 7.0, textDir, 'subtle')
  const cftLo = pickForeground(backgroundLs, 4.5, textDir, 'subtle')
  const cftDim = cftLo
  const cftSurf = textDir === 'light'
    ? {
        badgeBg: 'rgba(39,39,42,0.8)',
        statusBg: '#09090b',
        separator: 'rgba(39,39,42,0.6)',
        progTrack: 'rgba(39,39,42,0.8)',
        imgFallBg: 'rgba(39,39,42,1)',
      }
    : {
        badgeBg: 'rgba(255,255,255,0.6)',
        statusBg: 'rgba(255,255,255,0.5)',
        separator: 'rgba(212,212,216,0.6)',
        progTrack: 'rgba(212,212,216,0.8)',
        imgFallBg: 'rgba(255,255,255,0.4)',
      }

  const bio = discordProfile?.bio ?? TAGLINE

  const carouselItems: CarouselItem[] = [
    ...presence.activities.map((a): CarouselItem => ({ kind: 'activity', data: a })),
    ...(spotify ? [{ kind: 'spotify' as const, data: spotify, fromApi, isRecentlyPlayed }] : []),
  ]

  return (
    <div
      className="h-full rounded-3xl overflow-hidden relative"
      style={{
        ...cardBackground,
        '--cft-hi': cftHi,
        '--cft-mid': cftMid,
        '--cft-lo': cftLo,
        '--cft-dim': cftDim,
        '--cft-badge-bg': cftSurf.badgeBg,
        '--cft-status-bg': cftSurf.statusBg,
        '--cft-sep': cftSurf.separator,
        '--cft-prog-trk': cftSurf.progTrack,
        '--cft-img-fb': cftSurf.imgFallBg,
        '--cft-dot-hover': cftMid,
      } as CSSProperties}
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
                <h2 className="text-lg font-semibold text-(--cft-hi) leading-tight">
                  {presence.user.displayName}
                </h2>
                {presence.primaryGuild && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-(--cft-badge-bg) text-xs font-black text-(--cft-lo) tracking-widest mt-1">
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
                            className="px-1.5 py-0.5 rounded bg-(--cft-badge-bg) text-[10px] text-(--cft-lo) font-medium"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : null
                  })()
                )}
              </div>
              <p className="text-sm text-(--cft-lo)">@{presence.user.username}</p>
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
            <div className='bg-(--cft-status-bg) px-2 py-1 rounded-xl max-w-max shadow-lg my-1'>
              <p className="text-xs text-(--cft-lo) mt-0.5 flex items-center gap-2">
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

          <p className="text-sm text-(--cft-lo) mt-1">{bio}</p>
        </div>

        <div className="border-t border-(--cft-sep)" />

        {carouselItems.length === 0 ? (
          <p className="text-sm text-(--cft-dim) italic">No active activity</p>
        ) : (
          <ActivityCarousel items={carouselItems} />
        )}
      </div>
    </div>
  )
}
