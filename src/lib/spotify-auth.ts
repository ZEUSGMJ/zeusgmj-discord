import 'server-only';

let tokenCache: { token: string; expiresAt: number } | null = null;

export const RETOKEND_ENABLED = Boolean(
  process.env.RETOKEND_URL && process.env.RETOKEND_SECRET,
);
const RETOKEND_PROFILE =
  process.env.NODE_ENV === 'production'
    ? 'nextjs-portfolio-prod'
    : 'nextjs-portfolio-dev';

async function getAccessTokenFromRetokend(): Promise<string> {
  const res = await fetch(
    `${process.env.RETOKEND_URL}/api/token?profile=${RETOKEND_PROFILE}`,
    {
      headers: { Authorization: `Bearer ${process.env.RETOKEND_SECRET}` },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error(
        'Spotify token refresh failed via retokend: 409 reauth_required',
      );
    }
    throw new Error(`Spotify token refresh failed via retokend: ${res.status}`);
  }

  const data = await res.json();
  tokenCache = {
    token: data.access_token as string,
    expiresAt: data.expires_at as number,
  };
  return tokenCache.token;
}

async function getAccessTokenDirect(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_SECRET_ID;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify env vars');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64',
  );

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Spotify token refresh failed: ${res.status}`);
  const data = await res.json();
  const expiresIn: number = (data.expires_in as number) ?? 3600;
  tokenCache = {
    token: data.access_token as string,
    expiresAt: Date.now() + expiresIn * 1000 - 60_000,
  };
  return tokenCache.token;
}

export async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  return RETOKEND_ENABLED
    ? getAccessTokenFromRetokend()
    : getAccessTokenDirect();
}
