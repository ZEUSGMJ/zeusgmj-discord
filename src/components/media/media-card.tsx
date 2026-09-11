'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { AllTmdbData, TmdbMovie, TmdbResult } from '@/lib/tmdb.shared';
import { Film } from 'lucide-react';
import { DUR_MICRO, EASE_OUT } from '@/components/reveal/timing';

type Category = 'movies' | 'tv' | 'anime';
type Mode = 'favorites' | 'watched';

interface Props {
  data: AllTmdbData;
}

function ItemRow({ item }: { item: TmdbMovie }) {
  const [loaded, setLoaded] = useState(false);
  const hasPoster = !!item.posterUrl;

  return (
    <li className="flex gap-3">
      <div className="relative h-14 w-10 shrink-0">
        {hasPoster ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 animate-pulse rounded-lg bg-zinc-800" />
            )}
            <Image
              src={item.posterUrl!}
              alt={item.title}
              fill
              sizes="40px"
              onLoad={() => setLoaded(true)}
              className={`rounded-lg object-cover transition-opacity duration-300 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="absolute inset-0 animate-pulse rounded-lg bg-zinc-800" />
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-1.5">
        {hasPoster && !loaded ? (
          <>
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-800" />
            <div className="h-2 w-16 animate-pulse rounded bg-zinc-800" />
          </>
        ) : (
          <>
            <a
              href={item.tmdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm leading-tight font-medium text-zinc-200 transition-colors hover:text-zinc-400"
            >
              {item.title}
            </a>
            <p className="text-xs text-zinc-600">{item.releaseDate}</p>
          </>
        )}
      </div>
    </li>
  );
}

export default function MediaCard({ data }: Props) {
  const [category, setCategory] = useState<Category>('movies');
  const [mode, setMode] = useState<Mode>('favorites');
  const reduceMotion = useReducedMotion() ?? false;

  const result: TmdbResult =
    mode === 'favorites'
      ? data.favorites[category]
      : data.watched[category === 'tv' ? 'shows' : category];

  return (
    <div className="shine-edge h-full rounded-3xl border border-zinc-800/50 bg-zinc-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
          Media
        </h3>
        <Film className="h-4 w-4 text-zinc-500" />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="cursor-pointer rounded-lg border border-zinc-700/50 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="movies">Movies</option>
          <option value="tv">TV Shows</option>
          <option value="anime">Anime</option>
        </select>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setMode('favorites')}
            className={`transition-colors ${
              mode === 'favorites'
                ? 'font-medium text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Fav
          </button>
          <span className="text-zinc-700">·</span>
          <button
            onClick={() => setMode('watched')}
            className={`transition-colors ${
              mode === 'watched'
                ? 'font-medium text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Watched
          </button>
        </div>
      </div>

      {mode === 'watched' && result.itemCount !== undefined && (
        <p className="mb-3 text-xs text-zinc-500">
          {result.itemCount} {category} watched
        </p>
      )}

      {result.items.length === 0 ? (
        <p className="text-sm text-zinc-600 italic">No items found</p>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={`${category}-${mode}`}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR_MICRO, ease: EASE_OUT }}
            className="space-y-3"
          >
            {result.items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </motion.ul>
        </AnimatePresence>
      )}

      {result.error && (
        <p className="mt-3 text-xs text-zinc-700">{result.error}</p>
      )}
    </div>
  );
}
