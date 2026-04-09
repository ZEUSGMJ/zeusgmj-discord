import Image from 'next/image'
import type { NormalizedActivity } from '@/lib/lanyard.shared'

export type SpotifyDisplay = {
  songTitle: string
  artistLine: string
  artUrl: string | null
  albumTitle: string
}

export type CarouselItem =
  | { kind: 'activity'; data: NormalizedActivity }
  | { kind: 'spotify'; data: SpotifyDisplay; fromApi: boolean; isRecentlyPlayed?: boolean }

export default function ActivityRow({ item }: { item: CarouselItem }) {
  if (item.kind === 'spotify') {
    const { data, fromApi, isRecentlyPlayed } = item
    const label = isRecentlyPlayed ? 'Recently played' : fromApi ? 'Listening on Spotify' : 'Listening to Spotify'
    return (
      <div className="flex items-center gap-3">
        {data.artUrl ? (
          <Image
            src={data.artUrl}
            alt={data.albumTitle}
            width={48}
            height={48}
            className="w-12 h-12 rounded-xl shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-zinc-800 shrink-0 flex items-center justify-center">
            <span className="text-green-500 text-base">♫</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-0.5 font-medium">
            {label}
          </p>
          <p className="text-sm font-medium text-zinc-200 truncate">{data.songTitle}</p>
          <p className="text-xs text-zinc-400 truncate">{data.artistLine}</p>
        </div>
      </div>
    )
  }

  const { data } = item
  return (
    <div className="flex items-center gap-3">
      {data.largeImageUrl ? (
        <div className="relative shrink-0 w-12 h-12">
          <Image
            src={data.largeImageUrl}
            alt={data.largeText ?? data.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-xl"
          />
          {data.smallImageUrl && (
            <Image
              src={data.smallImageUrl}
              alt={data.smallText ?? ''}
              width={16}
              height={16}
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-zinc-900"
            />
          )}
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-zinc-800 shrink-0 flex items-center justify-center">
          <span className="text-zinc-600 text-lg">🎮</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-0.5 font-medium">Playing</p>
        <p className="text-sm font-medium text-zinc-200 truncate">{data.name}</p>
        {data.details && <p className="text-xs text-zinc-400 truncate">{data.details}</p>}
        {data.state && <p className="text-xs text-zinc-500 truncate">{data.state}</p>}
      </div>
    </div>
  )
}
