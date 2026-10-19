import Image from 'next/image';
import type { NormalizedPresence } from '@/lib/lanyard.shared';
import { hideOnError } from '@/components/ui/hide-on-error';

export default function StatusEmoji({
  customStatus,
  className,
}: {
  customStatus: NonNullable<NormalizedPresence['customStatus']>;
  className: string;
}) {
  if (customStatus.emojiUrl) {
    return (
      <Image
        src={customStatus.emojiUrl}
        alt={customStatus.emojiName ?? ''}
        width={48}
        height={48}
        className={`shrink-0 ${className}`}
        loading="lazy"
        unoptimized
        onError={hideOnError}
      />
    );
  }

  if (customStatus.emojiName) {
    return (
      <span className={`shrink-0 text-center leading-none ${className}`}>
        {customStatus.emojiName}
      </span>
    );
  }

  return null;
}
