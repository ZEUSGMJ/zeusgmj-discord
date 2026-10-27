import Image from 'next/image';
import { getTopTracks } from '@/lib/spotify';
import { deriveTileColors, tileStyle } from '@/lib/tile-color.shared';

const PLACEHOLDER = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%232a2e38"/></svg>`;

export default async function SpotifyCard() {
  const result = await getTopTracks();
  const [featured, ...rest] = result.tracks;
  const colors = deriveTileColors(result.accent, 'tracks');

  return (
    <section
      aria-label="Top tracks"
      style={tileStyle(colors)}
      className="flex flex-1 flex-col gap-3.5 rounded-tile bg-surface bg-linear-160 from-(--tile-tint) from-0% to-surface to-60% p-5.5 lg:gap-4 lg:p-6"
    >
      <h3 className="text-xs leading-4 font-medium text-(--tile-label)">
        Top tracks · 4 weeks
      </h3>

      {!featured ? (
        <p className="text-sm text-ink-dim italic">No recent tracks</p>
      ) : (
        <>
          <div className="group relative -m-2 flex items-center gap-3.5 rounded-2xl p-2 transition-colors duration-150 hover:bg-white/10 has-focus-visible:bg-white/10 lg:gap-4">
            {featured.albumArtUrl ? (
              <Image
                src={featured.albumArtUrl}
                alt={featured.albumName}
                width={280}
                height={280}
                className="size-24 shrink-0 rounded-xl object-cover transition-transform duration-150 group-hover:scale-[1.03] group-active:scale-[0.98] motion-reduce:transform-none lg:size-28 lg:rounded-[14px]"
                placeholder={PLACEHOLDER}
              />
            ) : (
              <div className="size-24 shrink-0 rounded-xl bg-[#2a2e38] lg:size-28 lg:rounded-[14px]" />
            )}
            <div className="flex min-w-0 flex-col gap-0.5">
              <a
                href={featured.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={featured.name}
                className="line-clamp-2 text-xl leading-6.5 font-bold tracking-[-0.01em] text-ink transition-colors group-hover:text-(--tile-label) after:absolute after:inset-0 after:content-[''] lg:text-[22px] lg:leading-7"
              >
                {featured.name}
              </a>
              <p
                title={featured.artists.join(', ')}
                className="truncate text-[13px] leading-4.5 text-ink-muted select-none"
              >
                {featured.artists.join(', ')}
              </p>
            </div>
          </div>

          {rest.length > 0 && (
            <ol start={2} className="flex flex-1 flex-col justify-between">
              {rest.map((track, index) => (
                <li
                  key={track.id}
                  className="group relative -mx-2.5 flex items-center gap-3 rounded-xl px-2.5 py-1.25 transition-[background-color,transform] duration-150 ease-out hover:bg-white/10 active:scale-[0.99] has-focus-visible:bg-white/10 lg:py-1.5"
                >
                  <span className="w-4.5 shrink-0 text-xs leading-4 font-medium text-ink-dim tabular-nums">
                    {String(index + 2).padStart(2, '0')}
                  </span>
                  {track.albumArtUrl ? (
                    <Image
                      src={track.albumArtUrl}
                      alt={track.albumName}
                      width={96}
                      height={96}
                      className="size-10 shrink-0 rounded-md object-cover transition-transform duration-150 group-hover:scale-105 motion-reduce:transform-none"
                      placeholder={PLACEHOLDER}
                    />
                  ) : (
                    <div className="size-10 shrink-0 rounded-md bg-[#2a2e38]" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col lg:flex-row lg:items-center lg:gap-3">
                    <a
                      href={track.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={track.name}
                      className="min-w-0 truncate text-sm leading-5 font-medium text-ink transition-colors group-hover:text-(--tile-label) after:absolute after:inset-0 after:content-[''] lg:flex-1"
                    >
                      {track.name}
                    </a>
                    <p
                      title={track.artists.join(', ')}
                      className="truncate text-xs leading-4 text-ink-muted select-none lg:max-w-[45%] lg:shrink-0"
                    >
                      {track.artists.join(', ')}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      {result.error && <p className="text-xs text-ink-dim">{result.error}</p>}
    </section>
  );
}
