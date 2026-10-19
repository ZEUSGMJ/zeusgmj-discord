import 'server-only';

import { getDominantColor } from '@/lib/image-color';

export interface SteamGame {
  appId: number;
  name: string;
  minutes2Weeks: number;
  minutesForever: number;
  iconUrl: string | null;
  storeUrl: string;
}

export interface SteamResult {
  games: SteamGame[];
  accent: string | null;
  error?: string;
}

const MOCK_ACCENT = '#e0763c';

const MOCK_GAMES: SteamGame[] = [
  {
    appId: 730,
    name: 'Counter-Strike 2',
    minutes2Weeks: 180,
    minutesForever: 12000,
    iconUrl: null,
    storeUrl: 'https://store.steampowered.com/app/730',
  },
  {
    appId: 570,
    name: 'Dota 2',
    minutes2Weeks: 60,
    minutesForever: 4800,
    iconUrl: null,
    storeUrl: 'https://store.steampowered.com/app/570',
  },
  {
    appId: 1172470,
    name: 'Apex Legends',
    minutes2Weeks: 0,
    minutesForever: 2400,
    iconUrl: null,
    storeUrl: 'https://store.steampowered.com/app/1172470',
  },
];

async function resolveStoreCapsule(appId: number): Promise<string | null> {
  try {
    const url = new URL(
      'https://api.steampowered.com/IStoreBrowseService/GetItems/v1',
    );
    url.searchParams.set(
      'input_json',
      JSON.stringify({
        ids: [{ appid: appId }],
        context: { language: 'english', country_code: 'US' },
        data_request: { include_assets: true },
      }),
    );

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = await res.json();
    const assets = data?.response?.store_items?.[0]?.assets as
      { asset_url_format?: string; library_capsule_2x?: string } | undefined;
    if (!assets?.asset_url_format || !assets.library_capsule_2x) return null;

    return `https://shared.steamstatic.com/store_item_assets/${assets.asset_url_format.replace('${FILENAME}', assets.library_capsule_2x)}`;
  } catch {
    return null;
  }
}

async function resolveImageUrl(appId: number): Promise<string | null> {
  const capsuleUrl = `https://shared.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`;

  try {
    const probe = await fetch(capsuleUrl, {
      method: 'HEAD',
      next: { revalidate: 1800 },
    });
    if (probe.ok) return capsuleUrl;
  } catch {}

  const storeCapsule = await resolveStoreCapsule(appId);
  if (storeCapsule) return storeCapsule;

  const gridDbKey = process.env.STEAMGRIDDB_API_KEY;
  if (gridDbKey) {
    try {
      const res = await fetch(
        `https://www.steamgriddb.com/api/v2/grids/steam/${appId}?dimensions=600x900`,
        {
          headers: { Authorization: `Bearer ${gridDbKey}` },
          next: { revalidate: 1800 },
        },
      );
      if (res.ok) {
        const data = await res.json();
        const grids = (data?.data ?? []) as Array<{
          url: string;
          style: string;
        }>;
        const grid = grids.find((g) => g.style === 'official') ?? grids[0];
        if (grid?.url) return grid.url;
      }
    } catch {}
  }

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=basic`,
      { next: { revalidate: 1800 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const headerImage = data?.[appId]?.data?.header_image as string | undefined;
    if (!headerImage) return null;
    return headerImage.replace(
      /^https:\/\/shared\.(akamai|cloudflare)\.steamstatic\.com\//,
      'https://shared.steamstatic.com/',
    );
  } catch {
    return null;
  }
}

export async function getRecentGames(): Promise<SteamResult> {
  const apiKey = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID;

  if (!apiKey || !steamId) {
    return { games: MOCK_GAMES, accent: MOCK_ACCENT };
  }

  try {
    const url = new URL(
      'https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/',
    );
    url.searchParams.set('key', apiKey);
    url.searchParams.set('steamid', steamId);
    url.searchParams.set('count', '3');
    url.searchParams.set('format', 'json');

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`Steam API failed: ${res.status}`);

    const data = await res.json();
    const rawGames = (data.response?.games ?? []) as Array<
      Record<string, unknown>
    >;

    const games: SteamGame[] = await Promise.all(
      rawGames.map(async (g) => ({
        appId: g.appid as number,
        name: g.name as string,
        minutes2Weeks: (g.playtime_2weeks as number) ?? 0,
        minutesForever: (g.playtime_forever as number) ?? 0,
        iconUrl: await resolveImageUrl(g.appid as number),
        storeUrl: `https://store.steampowered.com/app/${g.appid}`,
      })),
    );

    const accent = await getDominantColor(
      games[0]?.iconUrl?.replace('library_600x900_2x', 'library_600x900'),
    );

    return { games, accent };
  } catch (err) {
    console.error('[steam] getRecentGames error:', err);
    return { games: MOCK_GAMES, accent: MOCK_ACCENT, error: 'Failed to load' };
  }
}
