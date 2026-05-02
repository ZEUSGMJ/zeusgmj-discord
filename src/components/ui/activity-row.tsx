'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { NormalizedActivity } from '@/lib/lanyard.shared'

type SpotifyTimestamps = {
  start: number
  end: number
}

export type SpotifyDisplay = {
  songTitle: string
  artistLine: string
  artUrl: string | null
  albumTitle: string
  timestamps: SpotifyTimestamps | null
}

export type CarouselItem =
  | { kind: 'activity'; data: NormalizedActivity }
  | { kind: 'spotify'; data: SpotifyDisplay; fromApi: boolean; isRecentlyPlayed?: boolean }

function getValidSpotifyTimestamps(
  timestamps: SpotifyDisplay['timestamps'],
): SpotifyTimestamps | null {
  if (
    timestamps &&
    Number.isFinite(timestamps.start) &&
    Number.isFinite(timestamps.end) &&
    timestamps.end > timestamps.start
  ) {
    return timestamps
  }

  return null
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function SpotifyProgress({ timestamps }: { timestamps: SpotifyTimestamps }) {
  const [now, setNow] = useState(() => Date.now())
  const durationMs = timestamps.end - timestamps.start
  const elapsedMs = Math.min(Math.max(now - timestamps.start, 0), durationMs)
  const progress = durationMs > 0 ? (elapsedMs / durationMs) * 100 : 0

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [timestamps.start, timestamps.end])

  return (
    <div className="mt-2">
      <div
        className="h-1 overflow-hidden rounded-full bg-(--cft-prog-trk)"
        aria-label={`Spotify progress ${formatDuration(elapsedMs)} of ${formatDuration(durationMs)}`}
        aria-valuemax={durationMs}
        aria-valuemin={0}
        aria-valuenow={elapsedMs}
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-(--cft-mid) transition-[width] duration-500 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-medium tabular-nums text-(--cft-lo)">
        <span>{formatDuration(elapsedMs)}</span>
        <span>{formatDuration(durationMs)}</span>
      </div>
    </div>
  )
}

export default function ActivityRow({ item }: { item: CarouselItem }) {
  if (item.kind === 'spotify') {
    const { data, fromApi, isRecentlyPlayed } = item
    const label = isRecentlyPlayed ? 'Recently played' : fromApi ? 'Listening on Spotify' : 'Listening to Spotify'
    const timestamps = fromApi ? null : getValidSpotifyTimestamps(data.timestamps)

    return (
      <div className="flex items-center gap-3">
        {data.artUrl ? (
          <Image
            src={data.artUrl}
            alt={data.albumTitle}
            width={128}
            height={128}
            className="w-24 h-24 rounded-xl shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-(--cft-img-fb) shrink-0 flex items-center justify-center">
            <span className="text-green-500 text-base">♫</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-(--cft-dim) uppercase tracking-widest mb-0.5 font-medium">
            {label}
          </p>
          <p className="text-sm font-medium text-(--cft-hi) truncate">{data.songTitle}</p>
          <p className="text-xs text-(--cft-mid) truncate">{data.artistLine}</p>
          {timestamps && <SpotifyProgress timestamps={timestamps} />}
        </div>
      </div>
    )
  }

  const { data } = item
  return (
    <div className="flex items-center gap-3">
      {data.largeImageUrl ? (
        <div className="relative shrink-0 w-24 h-24">
          <Image
            src={data.largeImageUrl}
            alt={data.largeText ?? data.name}
            width={128}
            height={128}
            className="w-24 h-24 rounded-xl"
          />
          {data.smallImageUrl && (
            <Image
              src={data.smallImageUrl}
              alt={data.smallText ?? ''}
              width={128}
              height={128}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full ring-4 ring-zinc-900"
            />
          )}
        </div>
      ) : (
        <div className="w-24 h-24 rounded-xl bg-(--cft-img-fb) shrink-0 flex items-center justify-center">
          <span className="text-(--cft-dim) text-lg">🎮</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-(--cft-dim) uppercase tracking-widest mb-0.5 font-medium">Playing</p>
        <p className="text-sm font-medium text-(--cft-hi) truncate">{data.name}</p>
        {data.details && <p className="text-xs text-(--cft-mid) truncate">{data.details}</p>}
        {data.state && <p className="text-xs text-(--cft-lo) truncate">{data.state}</p>}
      </div>
    </div>
  )
}
