import 'server-only';

import { getDominantColor } from '@/lib/image-color';
import type { AllTmdbData, TmdbMovie, TmdbResult } from '@/lib/tmdb.shared';

type RawTmdbResult = Omit<TmdbResult, 'accent'>;

const MOCK_ACCENTS = {
  movies: '#2ab5b0',
  tv: '#3f8fd6',
  anime: '#d6567f',
} as const;

async function withAccent(
  result: RawTmdbResult,
  mockAccent: string,
): Promise<TmdbResult> {
  if (result.error) return { ...result, accent: mockAccent };
  const poster = result.items[0]?.posterUrl?.replace('/w342/', '/w92/');
  return { ...result, accent: await getDominantColor(poster) };
}

const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('default', dateOptions);
}

function getPosterUrl(path: unknown): string | null {
  return typeof path === 'string'
    ? `https://image.tmdb.org/t/p/w342${path.startsWith('/') ? path : `/${path}`}`
    : null;
}

function mapMovie(m: Record<string, unknown>): TmdbMovie {
  return {
    id: m.id as number,
    title: (m.title ?? m.name) as string,
    posterUrl: getPosterUrl(m.poster_path),
    releaseDate: formatDate(
      ((m.release_date ?? m.first_air_date) as string) ?? '',
    ),
    tmdbUrl: m.title
      ? `https://www.themoviedb.org/movie/${m.id}`
      : `https://www.themoviedb.org/tv/${m.id}`,
  };
}

const MOCK_MOVIES: TmdbMovie[] = [
  {
    id: 157336,
    title: 'Interstellar',
    posterUrl: null,
    releaseDate: 'Nov 7, 2014',
    tmdbUrl: 'https://www.themoviedb.org/movie/157336',
  },
  {
    id: 335984,
    title: 'Blade Runner 2049',
    posterUrl: null,
    releaseDate: 'Oct 6, 2017',
    tmdbUrl: 'https://www.themoviedb.org/movie/335984',
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    posterUrl: null,
    releaseDate: 'Mar 1, 2024',
    tmdbUrl: 'https://www.themoviedb.org/movie/693134',
  },
];

const MOCK_TV: TmdbMovie[] = [
  {
    id: 1396,
    title: 'Breaking Bad',
    posterUrl: null,
    releaseDate: 'Jan 20, 2008',
    tmdbUrl: 'https://www.themoviedb.org/tv/1396',
  },
  {
    id: 60574,
    title: 'Peaky Blinders',
    posterUrl: null,
    releaseDate: 'Sep 12, 2013',
    tmdbUrl: 'https://www.themoviedb.org/tv/60574',
  },
];

const MOCK_ANIME: TmdbMovie[] = [
  {
    id: 31911,
    title: 'Fullmetal Alchemist: Brotherhood',
    posterUrl: null,
    releaseDate: 'Apr 5, 2009',
    tmdbUrl: 'https://www.themoviedb.org/tv/31911',
  },
  {
    id: 46260,
    title: 'Attack on Titan',
    posterUrl: null,
    releaseDate: 'Apr 7, 2013',
    tmdbUrl: 'https://www.themoviedb.org/tv/46260',
  },
];

async function getFavoriteMovies(
  readToken: string,
  accountId: string,
): Promise<RawTmdbResult> {
  try {
    const url = `https://api.themoviedb.org/3/account/${accountId}/favorite/movies?language=en-US&page=1&sort_by=created_at.desc`;
    const res = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${readToken}`,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const items = ((data.results ?? []) as Array<Record<string, unknown>>)
      .slice(0, 4)
      .map(mapMovie);
    return { items, label: 'Movie Favorites' };
  } catch (err) {
    console.error('[tmdb] getFavoriteMovies error:', err);
    return {
      items: MOCK_MOVIES,
      label: 'Movie Favorites',
      error: 'Failed to load',
    };
  }
}

async function getFavoriteTVAndAnime(
  readToken: string,
  accountId: string,
): Promise<{ tv: RawTmdbResult; anime: RawTmdbResult }> {
  try {
    const url = `https://api.themoviedb.org/3/account/${accountId}/favorite/tv?language=en-US&page=1&sort_by=created_at.desc`;
    const res = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${readToken}`,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const all = (data.results ?? []) as Array<Record<string, unknown>>;
    const tvItems = all
      .filter((s) => s.original_language !== 'ja')
      .slice(0, 4)
      .map(mapMovie);
    const animeItems = all
      .filter((s) => s.original_language === 'ja')
      .slice(0, 4)
      .map(mapMovie);
    return {
      tv: { items: tvItems, label: 'TV Favorites' },
      anime: { items: animeItems, label: 'Anime Favorites' },
    };
  } catch (err) {
    console.error('[tmdb] getFavoriteTVAndAnime error:', err);
    return {
      tv: { items: MOCK_TV, label: 'TV Favorites', error: 'Failed to load' },
      anime: {
        items: MOCK_ANIME,
        label: 'Anime Favorites',
        error: 'Failed to load',
      },
    };
  }
}

const WATCHED_LIST_IDS = {
  movies: 8565543,
  shows: 8565544,
  anime: 8565545,
};

async function getWatchedList(
  readToken: string,
  type: keyof typeof WATCHED_LIST_IDS,
  label: string,
  mockItems: TmdbMovie[],
): Promise<RawTmdbResult> {
  try {
    const listId = WATCHED_LIST_IDS[type];
    const res = await fetch(`https://api.themoviedb.org/3/list/${listId}`, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${readToken}`,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const itemCount: number = data.item_count ?? 0;
    const items = ((data.items ?? []) as Array<Record<string, unknown>>)
      .slice(0, 4)
      .map(mapMovie);
    return { items, label, itemCount };
  } catch (err) {
    console.error(`[tmdb] getWatchedList(${type}) error:`, err);
    return { items: mockItems, label, error: 'Failed to load' };
  }
}

export async function getAllTmdbData(): Promise<AllTmdbData> {
  const readToken = process.env.TMDB_API_READ_ACCESS_TOKEN;
  const accountId = process.env.TMDB_ACCOUNT_ID;

  if (!readToken || !accountId) {
    console.warn(
      '[tmdb] Missing TMDB_API_READ_ACCESS_TOKEN or TMDB_ACCOUNT_ID — using mock data',
    );
    return {
      favorites: {
        movies: {
          items: MOCK_MOVIES,
          label: 'Movie Favorites',
          accent: MOCK_ACCENTS.movies,
        },
        tv: {
          items: MOCK_TV,
          label: 'TV Favorites',
          accent: MOCK_ACCENTS.tv,
        },
        anime: {
          items: MOCK_ANIME,
          label: 'Anime Favorites',
          accent: MOCK_ACCENTS.anime,
        },
      },
      watched: {
        movies: {
          items: MOCK_MOVIES,
          label: 'Movies Watched',
          accent: MOCK_ACCENTS.movies,
        },
        shows: {
          items: MOCK_TV,
          label: 'Shows Watched',
          accent: MOCK_ACCENTS.tv,
        },
        anime: {
          items: MOCK_ANIME,
          label: 'Anime Watched',
          accent: MOCK_ACCENTS.anime,
        },
      },
    };
  }

  const [favMovies, favTVAndAnime, watchedMovies, watchedShows, watchedAnime] =
    await Promise.all([
      getFavoriteMovies(readToken, accountId),
      getFavoriteTVAndAnime(readToken, accountId),
      getWatchedList(readToken, 'movies', 'Movies Watched', MOCK_MOVIES),
      getWatchedList(readToken, 'shows', 'Shows Watched', MOCK_TV),
      getWatchedList(readToken, 'anime', 'Anime Watched', MOCK_ANIME),
    ]);

  const [
    favMoviesResult,
    favTvResult,
    favAnimeResult,
    watchedMoviesResult,
    watchedShowsResult,
    watchedAnimeResult,
  ] = await Promise.all([
    withAccent(favMovies, MOCK_ACCENTS.movies),
    withAccent(favTVAndAnime.tv, MOCK_ACCENTS.tv),
    withAccent(favTVAndAnime.anime, MOCK_ACCENTS.anime),
    withAccent(watchedMovies, MOCK_ACCENTS.movies),
    withAccent(watchedShows, MOCK_ACCENTS.tv),
    withAccent(watchedAnime, MOCK_ACCENTS.anime),
  ]);

  return {
    favorites: {
      movies: favMoviesResult,
      tv: favTvResult,
      anime: favAnimeResult,
    },
    watched: {
      movies: watchedMoviesResult,
      shows: watchedShowsResult,
      anime: watchedAnimeResult,
    },
  };
}
