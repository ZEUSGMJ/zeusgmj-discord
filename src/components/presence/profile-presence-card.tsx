'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { DiscordProfileData } from '@/lib/discord-profile.shared'
import { intToHex } from '@/lib/discord-profile.shared'
import { buildPresenceTheme } from '@/lib/presence-theme.shared'
import { usePresence } from '@/components/presence/presence-provider'
import PresenceHeader from '@/components/presence/presence-header'
import PresenceIdentity from '@/components/presence/presence-identity'
import ActivityCarousel from '@/components/presence/activity-carousel'
import { normalizeSpotify, type CarouselItem } from '@/components/presence/activity-row'

const TAGLINE = 'building things on the internet'

export default function ProfilePresenceCard() {
  const { state, userId: discordUserId } = usePresence()
  const [discordProfile, setDiscordProfile] = useState<DiscordProfileData | null>(null)

  useEffect(() => {
    fetch('/api/discord-profile')
      .then((r) => r.ok ? r.json() as Promise<DiscordProfileData> : null)
      .then((data) => setDiscordProfile(data))
      .catch(() => {})
  }, [])

  const themeColor1 = discordProfile?.themeColors ? intToHex(discordProfile.themeColors[0]) : null
  const themeColor2 = discordProfile?.themeColors ? intToHex(discordProfile.themeColors[1]) : null

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--theme-primary',
      themeColor1 ?? 'rgba(255,255,255,0.06)'
    )
    document.documentElement.style.setProperty(
      '--theme-accent',
      themeColor2 ?? 'rgba(255,255,255,0.06)'
    )
    document.documentElement.style.setProperty(
      '--theme-page-accent',
      themeColor1 ?? 'var(--color-background)'
    )
  }, [themeColor1, themeColor2])

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

  const dcdnBannerHash = discordProfile?.bannerHash ?? null
  const bannerUrl = presence.user.bannerUrl
    ?? (dcdnBannerHash
      ? `https://cdn.discordapp.com/banners/${presence.user.id}/${dcdnBannerHash}.webp?size=2048${dcdnBannerHash.startsWith('a_') ? '&animated=true' : ''}`
      : null)

  const theme = buildPresenceTheme(themeColor1, themeColor2, presence.user.bannerColor)

  const bio = discordProfile?.bio ?? TAGLINE

  const carouselItems: CarouselItem[] = [
    ...presence.activities.map((a): CarouselItem => ({ kind: 'activity', data: a })),
    ...(spotify ? [{ kind: 'spotify' as const, data: spotify, fromApi, isRecentlyPlayed }] : []),
  ]

  return (
    <div className="h-full rounded-3xl overflow-hidden relative flex flex-col" style={theme}>
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

      <div className="px-6 pb-6 flex-1 flex flex-col gap-4">
        <PresenceHeader user={presence.user} status={presence.status} />

        <PresenceIdentity
          user={presence.user}
          primaryGuild={presence.primaryGuild}
          customStatus={presence.customStatus}
          badges={discordProfile?.badges ?? []}
          bio={bio}
          discordUserId={discordUserId}
          accentColor={themeColor2}
        />

        <div className="border-t border-(--cft-sep)" />

        <div className="flex-1 flex flex-col justify-center">
          {carouselItems.length === 0 ? (
            <p className="text-sm text-(--cft-dim) italic">No active activity</p>
          ) : (
            <ActivityCarousel items={carouselItems} />
          )}
        </div>
      </div>
    </div>
  )
}
