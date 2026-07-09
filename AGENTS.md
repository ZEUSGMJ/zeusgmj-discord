<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Overview

Personal profile site displaying live data from Spotify, Steam, Discord (via Lanyard), and TMDB. Built with Next.js 16, React 19, Tailwind CSS v4, TypeScript.

# Architecture

## Rendering model
- **Server components by default.** `SpotifyCard`, `SteamCard`, and `MediaCardWrapper` are async server components that call lib functions directly - no API routes involved.
- **`ProfilePresenceCard` is `'use client'`** because it shows live Discord presence data. It connects to the Lanyard WebSocket (`wss://api.lanyard.rest/socket`) directly, fetches `/api/discord-profile` on mount, and conditionally fetches `/api/spotify/now-playing` and `/api/spotify/recently-played` when Lanyard is not already reporting Spotify activity.
- **`LinksCard`** is a static server component with no data fetching.

Note: `api/lanyard/route.ts` exists as a REST fallback but is **not used** by `ProfilePresenceCard`.

## Data flow
```
Server components       Client components
      |                       |
      v                       v
  src/lib/*.ts          /api/* routes
  (direct calls)        (proxy to lib)
      |                       |
      +----------+------------+
                 v
          External APIs
    (Spotify / Steam / TMDB / Lanyard / dcdn.dstn.to)
```

`ProfilePresenceCard` also connects to `wss://api.lanyard.rest/socket` directly (WebSocket, no API route) and calls `https://dcdn.dstn.to/profile/{userId}` via `/api/discord-profile` for richer profile data (banner, theme colors, badges, bio).

## File structure
```
src/
  app/
    page.tsx              # Root layout, Suspense boundaries, skeleton fallbacks
    layout.tsx            # HTML shell, fonts, metadata
    globals.css           # Tailwind import, :root color-scheme, scrollbar styles
    api/
      lanyard/route.ts          # REST proxy for Lanyard (not used by ProfilePresenceCard)
      discord-profile/route.ts  # Proxies dcdn.dstn.to -> client
      spotify/
        now-playing/route.ts    # Proxies Spotify currently-playing -> client
        recently-played/route.ts # Proxies Spotify recently-played -> client
  components/
    profile-presence-card.tsx  # 'use client' - Discord presence, Spotify, badges
    spotify-card.tsx           # Server - top tracks (last 4 weeks)
    steam-card.tsx             # Server - recently played games
    media-card-wrapper.tsx     # Server - fetches TMDB data, passes to MediaCard
    media-card.tsx             # 'use client' - tab state (movies/tv/anime, fav/watched)
    links-card.tsx             # Static - social links
    ui/
      status-dot.tsx           # Presentational - Discord status indicator dot
      activity-row.tsx         # Presentational - single activity or Spotify row
      activity-carousel.tsx    # 'use client' - paginated carousel of activity rows
      discord-badge.tsx        # Presentational - single dcdn Discord badge icon
  lib/
    lanyard.shared.ts    # Client-safe Lanyard types + normalizeLanyard
    lanyard.ts           # Server-only Lanyard REST fetch
    discord-profile.shared.ts # Client-safe Discord profile types + color helpers
    discord-profile.ts   # Server-only dcdn.dstn.to fetch
    spotify.shared.ts    # Client-safe Spotify track/result types
    spotify.ts           # Server-only token cache, top tracks, currently playing, recently played
    steam.ts             # Steam recently played games
    tmdb.shared.ts       # Client-safe TMDB result types
    tmdb.ts              # TMDB favorites + watched lists (parallel fetches)
    utils.ts             # formatPlaytime, truncate
    site.ts              # Site URL helper for metadata and sitemap
```

# Environment Variables
All must be set in `.env.local`. Never commit values.

| Variable | Used in | Purpose |
|---|---|---|
| `SPOTIFY_CLIENT_ID` | `lib/spotify.ts` | OAuth app client ID |
| `SPOTIFY_SECRET_ID` | `lib/spotify.ts` | OAuth app client secret |
| `SPOTIFY_REFRESH_TOKEN` | `lib/spotify.ts` | Long-lived refresh token |
| `RETOKEND_URL` | `lib/spotify.ts` | Optional. Base URL of a retokend token-broker instance. When set together with `RETOKEND_SECRET`, overrides the `SPOTIFY_*` flow above |
| `RETOKEND_SECRET` | `lib/spotify.ts` | Optional. Bearer secret sent to the retokend instance's `/api/token` endpoint |
| `TMDB_API_KEY` | - | Reserved (v3 key, unused currently) |
| `TMDB_API_READ_ACCESS_TOKEN` | `lib/tmdb.ts` | Bearer token for TMDB v3 API |
| `TMDB_ACCOUNT_ID` | `lib/tmdb.ts` | TMDB account ID for favorites/lists |
| `DISCORD_USER_ID` | `api/lanyard/route.ts`, `api/discord-profile/route.ts` | Discord user ID (server-side) |
| `NEXT_PUBLIC_DISCORD_USER_ID` | `components/profile-presence-card.tsx` | Discord user ID (client-side, for Lanyard WebSocket) |
| `SITE_URL` | `lib/site.ts` | Optional canonical production URL for metadata and sitemap |
| `STEAM_API_KEY` | `lib/steam.ts` | Steam Web API key |
| `STEAM_ID` | `lib/steam.ts` | Steam 64-bit user ID |
| `STEAMGRIDDB_API_KEY` | `lib/steam.ts` | SteamGridDB API key (portrait grid fallback for games without an official library capsule) |

When env vars are missing, all lib functions fall back to hardcoded mock data - the site will still render.

# Key Conventions

## No unnecessary API routes
Server components call lib functions directly. Only create an API route when the client genuinely needs it (e.g., live-updating data that cannot be SSR'd).

## Caching strategy
- `cache: 'no-store'` - live data (Lanyard, Spotify now-playing, Spotify token refresh)
- `next: { revalidate: 3600 }` - hourly data (Spotify top tracks, TMDB)
- `next: { revalidate: 1800 }` - 30-min data (Steam recent games)

## Spotify token caching
`getAccessToken()` in `lib/spotify.ts` caches the token in a module-level variable with expiry. Do not remove this - Spotify tokens are valid for 1 hour and calling the token endpoint on every request wastes quota.

When `RETOKEND_URL`/`RETOKEND_SECRET` are both set, `getAccessToken()` fetches from that retokend instance's `/api/token?profile=...` endpoint instead of refreshing directly against Spotify - retokend owns the actual Spotify refresh token in that case. `RETOKEND_ENABLED` in `lib/spotify.ts` selects the profile (`nextjs-portfolio-prod`/`nextjs-portfolio-dev`) based on `NODE_ENV`. This is optional - with those vars unset, the direct `SPOTIFY_*` refresh-token flow is used unchanged.

## Mock data
Every lib function returns mock data when env vars are absent. Keep mocks in sync with the real data shape when changing interfaces.

## Image optimization
Remote image domains are declared in `next.config.ts` under `remotePatterns`. All external images use `<Image>` from `next/image` - never raw `<img>`.

**Animated images**: Use `unoptimized` (not a `.gif` URL) when the image may be animated. Discord signals animated assets with an `a_` hash prefix. For Discord CDN URLs, use `.webp?animated=true` (per Discord's docs) and set `unoptimized={url.includes('animated=true')}` on the `<Image>`.

**Badge icons**: Discord badge icons are `.png` only - `https://cdn.discordapp.com/badge-icons/{hash}.png`. Using `.webp` returns 404.

**LCP images**: Use `preload` for above-the-fold images that should be discovered early. `priority` is deprecated in Next.js 16.

**`fill` images**: Any `<Image fill>` must include a `sizes` prop describing its rendered width, e.g. `sizes="(max-width: 768px) 100vw, 400px"`. Omitting it causes a browser warning and defeats responsive image selection.

**Lanyard vs dcdn**: Lanyard's WebSocket payload does not include `banner` or `banner_color` for the Discord user. Fetch the banner hash from dcdn (`/api/discord-profile` -> `bannerHash`) and construct the URL in the component. dcdn can fail - always fall back gracefully (banner color -> hardcoded default).

## Tailwind v4
Uses `@import "tailwindcss"` and `@theme inline { }` - not the v3 `tailwind.config.js` approach. Custom colors (`--color-background`, `--color-foreground`) are declared in `globals.css` under `@theme inline` and used as `bg-background`, `text-foreground` etc.

## Comments
Do not add section comments, planning comments, or explanatory prose comments. Code should be self-evident.

# TMDB List IDs
Watched lists are hardcoded in `lib/tmdb.ts`. Do not change these without updating the actual TMDB account lists.

```
movies: 8565543
shows:  8565544
anime:  8565545
```

Anime is detected by `original_language === 'ja'` within the favorites TV endpoint. This is a known heuristic - do not "fix" it without a better signal.
