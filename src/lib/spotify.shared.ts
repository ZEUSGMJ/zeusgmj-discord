export interface SpotifyTopTrack {
  id: string
  name: string
  artists: string[]
  albumName: string
  albumArtUrl: string | null
  externalUrl: string
}

export interface SpotifyResult {
  tracks: SpotifyTopTrack[]
  error?: string
}

export interface SpotifyCurrentTrack {
  name: string
  artists: string[]
  albumName: string
  albumArtUrl: string | null
  externalUrl: string
  isPlaying: boolean
}

export interface SpotifyRecentTrack {
  name: string
  artists: string[]
  albumName: string
  albumArtUrl: string | null
  externalUrl: string
}
