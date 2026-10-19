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

const TILE_CLASS =
  'relative size-19 shrink-0 rounded-xl bg-(--cft-img-fb) lg:size-29 lg:rounded-2xl';
const LABEL_CLASS =
  'text-[11px] leading-3.5 font-semibold tracking-[0.06em] text-(--cft-mid) uppercase lg:text-xs lg:leading-4';
const TITLE_CLASS =
  'truncate text-base leading-[22px] font-bold text-(--cft-hi) lg:text-xl lg:leading-[26px]';
const DETAIL_CLASS =
  'truncate text-[13px] leading-[18px] text-(--cft-mid) lg:text-sm lg:leading-5';

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
      <div className="flex items-center gap-3.5 lg:gap-5">
        <div className={TILE_CLASS}>
          {data.artUrl ? (
            <Image
              src={data.artUrl}
              alt={data.albumTitle}
              width={232}
              height={232}
              className="size-full rounded-[inherit] object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="text-xl text-online">♫</span>
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 lg:gap-[3px]">
          <p className={LABEL_CLASS}>{label}</p>
          <p className={TITLE_CLASS}>{data.songTitle}</p>
          <p className={DETAIL_CLASS}>{data.artistLine}</p>
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
    <div className="flex items-center gap-3.5 lg:gap-5">
      <div className={TILE_CLASS}>
        {data.largeImageUrl ? (
          <Image
            src={data.largeImageUrl}
            alt={data.largeText ?? data.name}
            width={232}
            height={232}
            className="size-full rounded-[inherit] object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ActivityIcon className="size-6 text-(--cft-dim)" />
          </div>
        )}
        {data.largeImageUrl && data.smallImageUrl && (
          <Image
            src={data.smallImageUrl}
            alt={data.smallText ?? ''}
            width={88}
            height={88}
            className="absolute -right-2 -bottom-2 size-8 rounded-full border-[3px] border-(--cft-ring) bg-(--cft-ring) lg:-right-3 lg:-bottom-3 lg:size-11"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 lg:gap-[3px]">
        <p className={LABEL_CLASS}>{activityLabel}</p>
        <p className={TITLE_CLASS}>{data.name}</p>
        {data.details && <p className={DETAIL_CLASS}>{data.details}</p>}
        {data.state && (
          <p className={`${DETAIL_CLASS} text-(--cft-lo)`}>{data.state}</p>
        )}
        {timestamps && <ActivityProgress timestamps={timestamps} />}
      </div>
    </div>
  );
}
