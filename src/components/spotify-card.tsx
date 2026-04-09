import Image from 'next/image'
import { getTopTracks } from '@/lib/spotify'
import { Music } from 'lucide-react'

export default async function SpotifyCard() {
  const result = await getTopTracks()
  return (
    <div className="h-full rounded-3xl bg-zinc-900 border border-zinc-800/50 p-5 shine-edge">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
          Top Tracks (Last 4 Weeks)
        </h3>
        <Music className='text-zinc-500 w-4 h-4'/>
      </div>

      {result.tracks.length === 0 ? (
        <p className="text-sm text-zinc-600 italic">No recent tracks</p>
      ) : (
        <ol className="space-y-3">
          {result.tracks.map((track, i) => (
            <li key={track.id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-700 w-4 shrink-0 text-right">
                {i + 1}
              </span>
              {track.albumArtUrl ? (
                <Image
                  src={track.albumArtUrl}
                  alt={track.albumName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-xs shrink-0"
                  placeholder={`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%2327272a" rx="2"/></svg>`}
                />
              ) : (
                <div className="w-10 h-10 rounded-xs bg-zinc-800 shrink-0" />
              )}
              <div className="min-w-0">
                <a
                  href={track.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-zinc-200 truncate block hover:text-zinc-400 transition-colors"
                >
                  {track.name}
                </a>
                <p className="text-xs text-zinc-500 truncate">{track.artists.join(', ')}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {result.error && (
        <p className="text-xs text-zinc-700 mt-3">{result.error}</p>
      )}
    </div>
  )
}
