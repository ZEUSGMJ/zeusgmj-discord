export interface SpotifyTopTrack {
  id: string;
  name: string;
  artists: string[];
  albumName: string;
  albumArtUrl: string | null;
  externalUrl: string;
}

export interface SpotifyResult {
  tracks: SpotifyTopTrack[];
  error?: string;
}

export interface SpotifyCurrentTrack {
  name: string;
  artists: string[];
  albumName: string;
  albumArtUrl: string | null;
}

export interface SpotifyRecentTrack {
  name: string;
  artists: string[];
  albumName: string;
  albumArtUrl: string | null;
}

export function mapSpotifyTrack(
  raw: Record<string, unknown>,
  fallbackExternalUrl = 'https://open.spotify.com',
): {
  name: string;
  artists: string[];
  albumName: string;
  albumArtUrl: string | null;
  externalUrl: string;
} {
  const album = raw.album as Record<string, unknown>;
  const images = album.images as Array<{ url: string }> | undefined;
  const artists = raw.artists as Array<{ name: string }>;
  const externalUrls = raw.external_urls as Record<string, string> | undefined;
  return {
    name: raw.name as string,
    artists: artists.map((a) => a.name),
    albumName: album.name as string,
    albumArtUrl: images?.[0]?.url ?? null,
    externalUrl: externalUrls?.spotify ?? fallbackExternalUrl,
  };
}
