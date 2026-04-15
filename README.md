# zeusgmj.com

Started as a small experiment with [Lanyard](https://github.com/phineas/lanyard) and got a bit out of hand. Personal profile site showing live data from my accounts across a few platforms.

![Preview](https://zeusgmj.com/api/og)

## What it shows

- **Discord:** live presence, status, activities, badges, and profile via [Lanyard](https://github.com/phineas/lanyard) and dcdn
- **Spotify:** currently playing track, recently played, and top tracks
- **Steam:** recently played games and playtime
- **Movies / TV / Anime:** favorites and watched lists via TMDB

## Built with

- [Next.js 16](https://nextjs.org) + [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript

## Running locally

```bash
git clone https://github.com/ZEUSGMJ/zeusgmj-discord
cd zeusgmj-discord
pnpm install  # or npm install
pnpm dev      # or npm run dev
```

Copy `.env.example` to `.env.local` and fill in your credentials. All values are optional, any missing ones fall back to mock data.

## Credentials

**Discord**
No API key needed. Just your Discord user ID. Lanyard handles presence automatically if you are in the [Lanyard Discord server](https://discord.gg/lanyard).

**Spotify**
Create an app at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard). Note that as of early 2026, Spotify [updated their developer access requirements](https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security), worth reading before setting up. You will also need a refresh token via an OAuth flow, see the [Spotify docs](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens) for that.

**Steam**
Get an API key at [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey). Find your Steam ID at [steamid.io](https://steamid.io/lookup/).

**TMDB**
Follow the [TMDB getting started guide](https://developer.themoviedb.org/docs/getting-started) for a read access token and your account ID. The watched lists are hardcoded in `src/lib/tmdb.ts`, update those IDs to match your own TMDB lists.
