import Image from 'next/image';
import {
  badgeIconUrl,
  type DiscordProfileBadge,
} from '@/lib/discord-profile.shared';
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
      src={badgeIconUrl(badge)}
      alt={badge.description}
      width={80}
      height={80}
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
