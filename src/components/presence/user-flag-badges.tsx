import { BADGE_LABEL, USER_FLAGS } from '@/lib/lanyard.shared';

export default function UserFlagBadges({
  publicFlags,
}: {
  publicFlags: number;
}) {
  const textBadges = Object.entries(USER_FLAGS)
    .filter(([, bit]) => publicFlags & bit)
    .map(([name]) => BADGE_LABEL[name])
    .filter(Boolean);

  if (textBadges.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {textBadges.map((label) => (
        <span
          key={label}
          className="rounded bg-(--cft-badge-bg) px-1.5 py-0.5 text-[10px] font-medium text-(--cft-lo)"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
