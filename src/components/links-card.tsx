import type { ComponentType, SVGProps } from 'react';
import { LuArrowUpRight } from 'react-icons/lu';
import { SiGithub, SiSpotify, SiSteam, SiX } from 'react-icons/si';
import StatsFmIcon from '@/components/icons/stats-fm-icon';

interface LinkItem {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
  description: string;
}

const LINKS: LinkItem[] = [
  {
    label: 'GitHub',
    icon: SiGithub,
    href: 'https://github.com/ZEUSGMJ',
    description: 'Code & projects',
  },
  {
    label: 'Twitter / X',
    icon: SiX,
    href: 'https://x.com/zeusgmj',
    description: 'Mostly lurking',
  },
  {
    label: 'Spotify',
    icon: SiSpotify,
    href: 'https://open.spotify.com/user/wvckgj74wvfnyyzl8vtg6pwrr',
    description: 'I have some playlists',
  },
  {
    label: 'Steam',
    icon: SiSteam,
    href: 'https://steamcommunity.com/id/ZEUSGMJ/',
    description: 'Too many hours',
  },
  {
    label: 'Stats.fm',
    icon: StatsFmIcon,
    href: 'https://stats.fm/zeusgmj',
    description: 'Obsessively tracked',
  },
];

export default function LinksCard() {
  return (
    <nav aria-label="Links">
      <ul className="links-row grid grid-cols-2 gap-2 lg:gap-3">
        {LINKS.map((link, index) => {
          const isLast = index === LINKS.length - 1;
          const Icon = link.icon;

          return (
            <li
              key={link.href}
              className={isLast ? 'col-span-2 lg:col-span-1' : ''}
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full items-center gap-2.5 rounded-[20px] bg-surface px-3.5 py-3 transition-[background-color,transform] duration-150 hover:bg-surface-raised active:scale-[0.98] lg:gap-3 lg:rounded-[22px] lg:px-4"
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-(--theme-accent-ink,#7c8cff) transition-colors group-hover:bg-hairline lg:size-9"
                >
                  <Icon className="size-4 lg:size-4.5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col lg:mask-[linear-gradient(to_right,#000_calc(100%-1rem),transparent)]">
                  <span className="truncate text-[13px] leading-4.5 font-medium text-ink lg:text-clip">
                    {link.label}
                  </span>
                  <span className="truncate text-[11px] leading-3.5 text-ink-muted lg:text-xs lg:leading-4 lg:text-clip">
                    {link.description}
                  </span>
                </span>
                <LuArrowUpRight
                  aria-hidden="true"
                  className={`size-4 shrink-0 text-ink-dim transition-[color,transform] duration-150 group-hover:translate-x-px group-hover:-translate-y-px group-hover:text-ink ${isLast ? '' : 'hidden lg:block'}`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
