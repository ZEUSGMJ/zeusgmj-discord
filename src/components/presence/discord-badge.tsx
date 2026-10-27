import Image from 'next/image';
import type { DiscordProfileBadge } from '@/lib/discord-profile.shared';
import { hideOnError } from '@/components/ui/hide-on-error';

export default function DiscordBadge({
  badge,
  className = 'size-5',
}: {
  badge: DiscordProfileBadge;
  className?: string;
}) {
  const img = (
    <Image
      src={`https://cdn.discordapp.com/badge-icons/${badge.icon}.png`}
      alt={badge.description}
      width={44}
      height={44}
      title={badge.description}
      className={className}
      onError={hideOnError}
    />
  );

  if (badge.link) {
    return (
      <a
        href={badge.link}
        target="_blank"
        rel="noopener noreferrer"
        title={badge.description}
        className="shrink-0 transition-transform duration-150 ease-out active:scale-90"
      >
        {img}
      </a>
    );
  }

  return img;
}
