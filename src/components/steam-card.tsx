import Image from 'next/image';
import { randomInt } from 'node:crypto';
import { getRecentGames } from '@/lib/steam';
import { Gamepad, Gamepad2 } from 'lucide-react';

const EMPTY_GAME_MESSAGES = [
  { ascii: '(>_>)', message: 'No games lately. The grass won.' },
  { ascii: '(-_-)', message: "Steam says I've logged off and evolved." },
  { ascii: '(._.)', message: 'No recent games. Character development arc?' },
  { ascii: '[?]', message: 'No recent games. Suspiciously productive.' },
  { ascii: '(x_x)', message: 'The backlog is safe. For now.' },
];

export default async function SteamCard() {
  const result = await getRecentGames();
  const emptyMessage =
    result.games.length === 0
      ? EMPTY_GAME_MESSAGES[randomInt(EMPTY_GAME_MESSAGES.length)]
      : null;

  return (
    <div className="shine-edge h-full rounded-3xl border border-zinc-800/50 bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
          Recent Games
        </h3>
        <Gamepad2 className="h-4 w-4 text-zinc-500" />
      </div>

      {emptyMessage ? (
        <div className="flex min-h-36 flex-col items-center justify-center gap-2 text-center">
          <p className="font-mono text-lg text-zinc-500">
            {emptyMessage.ascii}
          </p>
          <p className="text-sm text-zinc-600 italic">{emptyMessage.message}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {result.games.map((game) => (
            <li key={game.appId} className="flex items-center gap-3">
              {game.iconUrl ? (
                <Image
                  src={game.iconUrl}
                  alt={game.name}
                  width={600}
                  height={900}
                  className="aspect-2/3 w-16 shrink-0 rounded-lg object-cover"
                  placeholder={`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%2327272a" rx="8"/></svg>`}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                  <Gamepad className="h-5 w-5 text-zinc-600" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <a
                  href={game.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm font-medium text-zinc-200 transition-colors hover:text-zinc-400"
                >
                  {game.name}
                </a>
                <p className="text-xs text-zinc-600">
                  {game.playtime2Weeks} recently
                </p>
                <p className="text-xs text-zinc-600">
                  {game.playtimeForever} total
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {result.error && (
        <p className="mt-3 text-xs text-zinc-700">{result.error}</p>
      )}
    </div>
  );
}
