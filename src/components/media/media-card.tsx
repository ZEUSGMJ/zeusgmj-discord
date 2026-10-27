'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { AllTmdbData, TmdbMovie, TmdbResult } from '@/lib/tmdb.shared';
import {
  TILE_SURFACE,
  deriveTileColors,
  tileStyle,
} from '@/lib/tile-color.shared';
import { DUR_MICRO, EASE_OUT, translatePx } from '@/components/reveal/timing';

type Category = 'movies' | 'tv' | 'anime';
type Mode = 'favorites' | 'watched';

interface Props {
  data: AllTmdbData;
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'movies', label: 'Movies' },
  { id: 'tv', label: 'TV' },
  { id: 'anime', label: 'Anime' },
];

const MODES: { id: Mode; label: string }[] = [
  { id: 'favorites', label: 'Favorites' },
  { id: 'watched', label: 'Watched' },
];

function getResult(
  data: AllTmdbData,
  mode: Mode,
  category: Category,
): TmdbResult {
  return mode === 'favorites'
    ? data.favorites[category]
    : data.watched[category === 'tv' ? 'shows' : category];
}

function Poster({ item, index }: { item: TmdbMovie; index: number }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <li className={`min-w-0 flex-1 ${index === 3 ? 'hidden lg:block' : ''}`}>
      <a
        href={item.tmdbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-2"
      >
        <span className="relative block h-[150px] overflow-hidden rounded-[10px] border border-white/10 bg-white/5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.98] lg:h-[196px] lg:rounded-xl">
          {item.posterUrl && (
            <Image
              src={item.posterUrl}
              alt=""
              fill
              sizes="(max-width: 1024px) 33vw, 110px"
              onLoad={() => setLoaded(true)}
              className={`object-cover transition-opacity duration-300 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </span>
        <span
          title={item.title}
          className="line-clamp-2 text-xs leading-4 font-medium text-ink"
        >
          {item.title}
        </span>
      </a>
    </li>
  );
}

export default function MediaCard({ data }: Props) {
  const [category, setCategory] = useState<Category>('movies');
  const [mode, setMode] = useState<Mode>('favorites');
  const reduceMotion = useReducedMotion() ?? false;

  const result = getResult(data, mode, category);
  const activeKey = `${mode}-${category}`;
  const activeColors = deriveTileColors(result.accent, 'media');

  const layers = MODES.flatMap(({ id: layerMode }) =>
    CATEGORIES.map(({ id }) => ({
      key: `${layerMode}-${id}`,
      tint: deriveTileColors(getResult(data, layerMode, id).accent, 'media')
        .tintStart,
    })),
  );

  return (
    <section
      aria-label="Media"
      style={tileStyle(activeColors)}
      className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-tile bg-surface p-[22px] lg:min-h-[340px] lg:p-6"
    >
      {layers.map((layer) => (
        <div
          key={layer.key}
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(in oklab 160deg, ${layer.tint} 0%, ${TILE_SURFACE} 65%)`,
          }}
          className={`pointer-events-none absolute inset-0 transition-opacity duration-240 ease-(--ease-out) motion-reduce:transition-none ${
            layer.key === activeKey ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      <div className="relative flex items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Media list"
          className="flex shrink-0 items-center gap-3"
        >
          {MODES.map(({ id, label }) => {
            const selected = id === mode;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => setMode(id)}
                className={`rounded-md text-xs leading-4 whitespace-nowrap transition-[color,transform] duration-150 active:scale-[0.97] ${
                  selected
                    ? 'font-semibold text-(--tile-label)'
                    : 'font-medium text-ink-dim hover:text-ink-muted'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label="Media category"
          className="flex gap-0.5 rounded-full bg-background/50 p-[3px]"
        >
          {CATEGORIES.map(({ id, label }) => {
            const selected = id === category;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(id)}
                className={`rounded-full px-2.5 py-[5px] text-xs leading-4 transition-[background-color,color,transform] duration-150 active:scale-[0.97] ${
                  selected
                    ? 'bg-(--theme-accent-ink,#7c8cff) px-3 font-semibold text-(--theme-accent-on,#07080a)'
                    : 'font-medium text-ink-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        {result.items.length === 0 ? (
          <p className="text-sm text-ink-dim italic">No items found</p>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={activeKey}
              initial={{
                opacity: 0,
                transform: reduceMotion ? translatePx() : translatePx(0, 4),
              }}
              animate={{ opacity: 1, transform: translatePx() }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR_MICRO, ease: EASE_OUT }}
              className="flex items-start gap-2.5 lg:gap-3"
            >
              {result.items.slice(0, 4).map((item, index) => (
                <Poster key={item.id} item={item} index={index} />
              ))}
            </motion.ul>
          </AnimatePresence>
        )}
        {result.error && (
          <p className="mt-3 text-xs text-ink-dim">{result.error}</p>
        )}
      </div>
    </section>
  );
}
