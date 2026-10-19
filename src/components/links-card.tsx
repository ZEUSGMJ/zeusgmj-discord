interface LinkItem {
  label: string;
  abbreviation: string;
  href: string;
  description: string;
}

const LINKS: LinkItem[] = [
  {
    label: 'GitHub',
    abbreviation: 'Gh',
    href: 'https://github.com/ZEUSGMJ',
    description: 'Code & projects',
  },
  {
    label: 'Twitter / X',
    abbreviation: 'X',
    href: 'https://x.com/zeusgmj',
    description: 'Mostly lurking',
  },
  {
    label: 'Spotify',
    abbreviation: 'Sp',
    href: 'https://open.spotify.com/user/wvckgj74wvfnyyzl8vtg6pwrr',
    description: 'I have some playlists',
  },
  {
    label: 'Steam',
    abbreviation: 'St',
    href: 'https://steamcommunity.com/id/ZEUSGMJ/',
    description: 'Too many hours',
  },
  {
    label: 'Stats.fm',
    abbreviation: 'Fm',
    href: 'https://stats.fm/zeusgmj',
    description: 'Obsessively tracked',
  },
];

export default function LinksCard() {
  return (
    <nav aria-label="Links">
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-5 lg:gap-3">
        {LINKS.map((link, index) => {
          const isLast = index === LINKS.length - 1;

          return (
            <li
              key={link.href}
              className={isLast ? 'col-span-2 lg:col-span-1' : ''}
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full items-center gap-2.5 rounded-[20px] bg-surface px-3.5 py-3 transition-[background-color,transform] duration-150 hover:bg-surface-raised active:scale-[0.98] lg:gap-3.5 lg:rounded-3xl lg:px-5 lg:py-4"
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-xs leading-4 font-semibold text-ink transition-colors group-hover:bg-hairline lg:size-10 lg:text-[13px]"
                >
                  {link.abbreviation}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] leading-[18px] font-medium text-ink lg:text-sm lg:leading-5">
                    {link.label}
                  </span>
                  <span className="truncate text-[11px] leading-3.5 text-ink-muted lg:text-xs lg:leading-4">
                    {link.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`text-[13px] leading-4 text-ink-dim transition-[color,transform] duration-150 group-hover:translate-x-px group-hover:-translate-y-px group-hover:text-ink lg:text-sm lg:leading-[18px] ${isLast ? '' : 'hidden lg:block'}`}
                >
                  ↗
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
