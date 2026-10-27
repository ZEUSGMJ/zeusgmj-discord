import Image from 'next/image';
import { LuGamepad } from 'react-icons/lu';
import { randomInt } from 'node:crypto';
import { getRecentGames, type SteamGame } from '@/lib/steam';
import { deriveTileColors, tileStyle } from '@/lib/tile-color.shared';
import { formatHours } from '@/lib/utils';

const EMPTY_GAME_MESSAGES = [
  { ascii: '(>_>)', message: 'No games lately. The grass won.' },
  { ascii: '(-_-)', message: "Steam says I've logged off and evolved." },
  { ascii: '(._.)', message: 'No recent games. Character development arc?' },
  { ascii: '[?]', message: 'No recent games. Suspiciously productive.' },
  { ascii: '(x_x)', message: 'The backlog is safe. For now.' },
];

const PLACEHOLDER = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%2326282f"/></svg>`;

function GameItem({ game, lead }: { game: SteamGame; lead: boolean }) {
  return (
    <li
      className={`shrink-0 ${lead ? 'w-[130px] lg:w-auto lg:max-w-[200px] lg:min-w-0 lg:flex-[1.35_1_0%]' : 'w-20 lg:w-auto lg:max-w-[150px] lg:min-w-0 lg:flex-[1_1_0%]'}`}
    >
      <a
        href={game.storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-2 lg:gap-2.5"
      >
        <span
          className={`relative block overflow-hidden border border-white/10 bg-[#26282f] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.98] ${
            lead
              ? 'h-[195px] rounded-xl border-white/12 lg:h-[220px] lg:rounded-[14px]'
              : 'h-[120px] rounded-[10px] lg:h-[164px] lg:rounded-xl'
          }`}
        >
          {game.iconUrl ? (
            <Image
              src={game.iconUrl}
              alt=""
              fill
              sizes={
                lead
                  ? '(max-width: 1024px) 130px, 168px'
                  : '(max-width: 1024px) 80px, 124px'
              }
              className="object-cover"
              placeholder={PLACEHOLDER}
              loading="lazy"
            />
          ) : (
            <span className="flex size-full items-center justify-center">
              <LuGamepad className="size-5 text-ink-dim" aria-hidden="true" />
            </span>
          )}
        </span>
        <span className="flex flex-col">
          <span
            className={`truncate text-ink ${
              lead
                ? 'text-sm leading-5 font-semibold'
                : 'text-xs leading-4 font-medium'
            }`}
          >
            {game.name}
          </span>
          <span className="truncate text-[11px] leading-3.5 text-ink-muted">
            {formatHours(game.minutes2Weeks)}
            {lead && ` · ${formatHours(game.minutesForever)} total`}
          </span>
        </span>
      </a>
    </li>
  );
}

export default async function SteamCard() {
  const result = await getRecentGames();
  const colors = deriveTileColors(result.accent, 'games');
  const [lead, ...others] = result.games;
  const totalMinutes = result.games.reduce(
    (sum, game) => sum + game.minutes2Weeks,
    0,
  );
  const emptyMessage = lead
    ? null
    : EMPTY_GAME_MESSAGES[randomInt(EMPTY_GAME_MESSAGES.length)];

  return (
    <section
      aria-label="Recent games"
      style={tileStyle(colors)}
      className="flex h-full flex-col gap-4 overflow-hidden rounded-tile bg-surface bg-linear-200/oklab from-(--tile-tint) from-0% to-surface to-65% p-[22px] lg:min-h-[340px] lg:justify-between lg:p-6"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-xs leading-4 font-medium text-(--tile-label)">
          Recent games · 2 weeks
        </h3>
        {lead && (
          <p className="text-xs leading-4 text-ink-muted">
            {formatHours(totalMinutes)}
          </p>
        )}
      </div>

      {emptyMessage ? (
        <div className="flex min-h-36 flex-col items-center justify-center gap-2 text-center">
          <p className="font-mono text-lg text-ink-muted">
            {emptyMessage.ascii}
          </p>
          <p className="text-sm text-ink-dim italic">{emptyMessage.message}</p>
        </div>
      ) : (
        <ul className="flex items-end gap-3 lg:gap-4">
          {lead && <GameItem game={lead} lead />}
          {others.map((game) => (
            <GameItem key={game.appId} game={game} lead={false} />
          ))}
        </ul>
      )}

      {result.error && <p className="text-xs text-ink-dim">{result.error}</p>}
    </section>
  );
}
