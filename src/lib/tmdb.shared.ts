export interface TmdbMovie {
  id: number
  title: string
  posterUrl: string | null
  releaseDate: string
  tmdbUrl: string
}

export interface TmdbResult {
  items: TmdbMovie[]
  label: string
  itemCount?: number
  error?: string
}

export interface AllTmdbData {
  favorites: {
    movies: TmdbResult
    tv: TmdbResult
    anime: TmdbResult
  }
  watched: {
    movies: TmdbResult
    shows: TmdbResult
    anime: TmdbResult
  }
}
