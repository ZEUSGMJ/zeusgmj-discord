'use client';

import Image from 'next/image';
import { Gamepad, MonitorPlay } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { NormalizedActivity, SpotifyTrack } from '@/lib/lanyard.shared';
import type {
  SpotifyCurrentTrack,
  SpotifyRecentTrack,
} from '@/lib/spotify.shared';

type ProgressTimestamps = {
  start: number;
  end: number;
};

export type SpotifyDisplay = {
  songTitle: string;
  artistLine: string;
  artUrl: string | null;
  albumTitle: string;
  timestamps: ProgressTimestamps | null;
};

export type CarouselItem =
  | { kind: 'activity'; data: NormalizedActivity }
  | {
      kind: 'spotify';
      data: SpotifyDisplay;
      fromApi: boolean;
      isRecentlyPlayed?: boolean;
    };

export function normalizeSpotify(
  track: SpotifyTrack | SpotifyCurrentTrack | SpotifyRecentTrack,
): SpotifyDisplay {
  if ('song' in track) {
    return {
      songTitle: track.song,
      artistLine: track.artist,
      artUrl: track.album_art_url,
      albumTitle: track.album,
      timestamps: track.timestamps,
    };
  }
  return {
    songTitle: track.name,
    artistLine: track.artists.join(', '),
    artUrl: track.albumArtUrl,
    albumTitle: track.albumName,
    timestamps: null,
  };
}

function getValidTimestamps(
  timestamps: ProgressTimestamps | null,
): ProgressTimestamps | null {
  if (
    timestamps &&
    Number.isFinite(timestamps.start) &&
    Number.isFinite(timestamps.end) &&
    timestamps.end > timestamps.start
  ) {
    return timestamps;
  }

  return null;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function ActivityProgress({ timestamps }: { timestamps: ProgressTimestamps }) {
  const [now, setNow] = useState(() => Date.now());
  const durationMs = timestamps.end - timestamps.start;
  const elapsedMs = Math.min(Math.max(now - timestamps.start, 0), durationMs);
  const progress = durationMs > 0 ? (elapsedMs / durationMs) * 100 : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [timestamps.start, timestamps.end]);

  return (
    <div className="mt-2">
      <div
        className="h-1 overflow-hidden rounded-full bg-(--cft-prog-trk)"
        aria-label={`Playback progress ${formatDuration(elapsedMs)} of ${formatDuration(durationMs)}`}
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
      <div className="mt-1 flex justify-between text-[10px] font-medium text-(--cft-lo) tabular-nums">
        <span>{formatDuration(elapsedMs)}</span>
        <span>{formatDuration(durationMs)}</span>
      </div>
    </div>
  );
}

export default function ActivityRow({ item }: { item: CarouselItem }) {
  if (item.kind === 'spotify') {
    const { data, fromApi, isRecentlyPlayed } = item;
    const label = isRecentlyPlayed
      ? 'Recently played'
      : fromApi
        ? 'Listening on Spotify'
        : 'Listening to Spotify';
    const timestamps = fromApi ? null : getValidTimestamps(data.timestamps);

    return (
      <div className="flex items-center gap-3">
        {data.artUrl ? (
          <Image
            src={data.artUrl}
            alt={data.albumTitle}
            width={128}
            height={128}
            className="h-24 w-24 shrink-0 rounded-xl"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-(--cft-img-fb)">
            <span className="text-base text-green-500">♫</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[11px] font-medium tracking-widest text-(--cft-dim) uppercase">
            {label}
          </p>
          <p className="truncate text-sm font-medium text-(--cft-hi)">
            {data.songTitle}
          </p>
          <p className="truncate text-xs text-(--cft-mid)">{data.artistLine}</p>
          {timestamps && <ActivityProgress timestamps={timestamps} />}
        </div>
      </div>
    );
  }

  const { data } = item;
  const activityLabel = data.type === 3 ? 'Watching' : 'Playing';
  const ActivityIcon = data.type === 3 ? MonitorPlay : Gamepad;
  const timestamps =
    data.type === 3 ? getValidTimestamps(data.timestamps) : null;

  return (
    <div className="flex items-center gap-3">
      {data.largeImageUrl ? (
        <div className="relative h-24 w-24 shrink-0">
          <Image
            src={data.largeImageUrl}
            alt={data.largeText ?? data.name}
            width={128}
            height={128}
            className="h-24 w-24 rounded-xl"
          />
          {data.smallImageUrl && (
            <Image
              src={data.smallImageUrl}
              alt={data.smallText ?? ''}
              width={128}
              height={128}
              className="absolute -right-1 -bottom-1 h-8 w-8 rounded-full bg-zinc-900 ring-4 ring-zinc-900"
            />
          )}
        </div>
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-(--cft-img-fb)">
          <ActivityIcon className="h-6 w-6 text-(--cft-dim)" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[11px] font-medium tracking-widest text-(--cft-dim) uppercase">
          {activityLabel}
        </p>
        <p className="truncate text-sm font-medium text-(--cft-hi)">
          {data.name}
        </p>
        {data.details && (
          <p className="truncate text-xs text-(--cft-mid)">{data.details}</p>
        )}
        {data.state && (
          <p className="truncate text-xs text-(--cft-lo)">{data.state}</p>
        )}
        {timestamps && <ActivityProgress timestamps={timestamps} />}
      </div>
    </div>
  );
}
