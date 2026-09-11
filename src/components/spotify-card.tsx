import Image from 'next/image';
import { getTopTracks } from '@/lib/spotify';
import { Music } from 'lucide-react';

export default async function SpotifyCard() {
  const result = await getTopTracks();
  return (
    <div className="shine-edge h-full rounded-3xl border border-zinc-800/50 bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
          Top Tracks (Last 4 Weeks)
        </h3>
        <Music className="h-4 w-4 text-zinc-500" />
      </div>

      {result.tracks.length === 0 ? (
        <p className="text-sm text-zinc-600 italic">No recent tracks</p>
      ) : (
        <ol className="space-y-3">
          {result.tracks.map((track) => (
            <li key={track.id} className="flex items-center gap-3">
              {track.albumArtUrl ? (
                <Image
                  src={track.albumArtUrl}
                  alt={track.albumName}
                  width={128}
                  height={128}
                  className="h-13 w-13 shrink-0 rounded-xs"
                  placeholder={`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%2327272a" rx="2"/></svg>`}
                />
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-xs bg-zinc-800" />
              )}
              <div className="min-w-0">
                <a
                  href={track.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={track.name}
                  className="block truncate text-sm font-medium text-zinc-200 transition-colors hover:text-zinc-400"
                >
                  {track.name}
                </a>
                <p
                  title={track.artists.join(', ')}
                  className="truncate text-xs text-zinc-500 select-none"
                >
                  {track.artists.join(', ')}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {result.error && (
        <p className="mt-3 text-xs text-zinc-700">{result.error}</p>
      )}
    </div>
  );
}
