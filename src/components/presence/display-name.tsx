import type { DisplayNameStyles } from '@/lib/discord-profile.shared';
import { resolveDisplayName } from '@/lib/display-name.shared';

interface DisplayNameProps {
  name: string;
  styles?: DisplayNameStyles | null;
  className?: string;
}

export default function DisplayName({
  name,
  styles,
  className,
}: DisplayNameProps) {
  const resolved = resolveDisplayName(styles);

  if (!resolved) return <span className={className}>{name}</span>;

  return (
    <span
      className={className ? `display-name ${className}` : 'display-name'}
      data-effect={resolved.effect}
      data-text={name}
      style={resolved.style}
    >
      {name}
    </span>
  );
}
