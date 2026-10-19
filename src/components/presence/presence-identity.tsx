import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { NormalizedPresence } from '@/lib/lanyard.shared';
import type { DiscordProfileBadge } from '@/lib/discord-profile.shared';
import DiscordBadge from '@/components/presence/discord-badge';
import DisplayName from '@/components/presence/display-name';
import { STATUS_LABEL } from '@/components/presence/status-dot';
import UserFlagBadges from '@/components/presence/user-flag-badges';
import BioMarkdown from '@/components/presence/bio-markdown';
import { DUR_MICRO, EASE_OUT } from '@/components/reveal/timing';

interface PresenceIdentityProps {
  user: NormalizedPresence['user'];
  status: NormalizedPresence['status'];
  primaryGuild: NormalizedPresence['primaryGuild'];
  customStatus: NormalizedPresence['customStatus'];
  badges: DiscordProfileBadge[];
  bio: string;
  activityCount: number;
  compact?: boolean;
}

function GuildTag({
  primaryGuild,
  compact,
}: {
  primaryGuild: NonNullable<NormalizedPresence['primaryGuild']>;
  compact: boolean;
}) {
  return (
    <span
      className={
        compact
          ? 'flex shrink-0 items-center gap-1 rounded-md bg-white/8 py-0.5 pr-1.5 pl-1 text-[10px] leading-3 font-extrabold tracking-[0.06em] text-ink lg:gap-[5px] lg:pr-2 lg:pl-[5px] lg:text-[11px] lg:leading-3.5'
          : 'flex shrink-0 items-center gap-1 rounded-md bg-[#0a0a19]/50 px-2 py-0.5 text-[11px] leading-4 font-bold tracking-[0.04em] text-(--cft-hi) lg:px-[9px] lg:py-[3px] lg:text-xs'
      }
    >
      {primaryGuild.badgeUrl && (
        <Image
          src={primaryGuild.badgeUrl}
          alt=""
          width={24}
          height={24}
          className={
            compact
              ? 'size-2.5 rounded-[3px] lg:size-3'
              : 'size-3 rounded-[3px]'
          }
          aria-hidden
        />
      )}
      {primaryGuild.tag}
    </span>
  );
}

function StatusEmoji({
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

function PresenceIdentityCompact({
  user,
  primaryGuild,
  customStatus,
  badges,
  activityCount,
}: PresenceIdentityProps) {
  const statusText = customStatus?.text ?? null;
  const hasStatus = Boolean(
    customStatus && (customStatus.text ?? customStatus.emojiName),
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
      <div className="flex min-w-0 items-center gap-1.5 lg:gap-2">
        <h2 className="min-w-0 text-[22px] leading-8 font-bold tracking-[-0.02em] text-ink lg:text-[26px] lg:leading-9">
          <DisplayName
            name={user.displayName}
            styles={user.displayNameStyles}
          />
        </h2>
        {primaryGuild && <GuildTag primaryGuild={primaryGuild} compact />}
        {badges.slice(0, 2).map((badge) => (
          <DiscordBadge
            key={badge.id}
            badge={badge}
            className="size-3.5 shrink-0 lg:size-4"
          />
        ))}
      </div>
      {(activityCount > 0 || hasStatus) && (
        <div className="flex min-w-0 items-center gap-1.5 lg:gap-2">
          {activityCount > 0 && (
            <span className="shrink-0 rounded-[5px] bg-online/16 px-[5px] py-px text-[10px] leading-3.5 font-bold text-[#46d68c] lg:px-1.5 lg:text-[11px]">
              +{activityCount}
            </span>
          )}
          {customStatus && (
            <StatusEmoji
              customStatus={customStatus}
              className="size-3 text-[10px] lg:size-3.5 lg:text-xs"
            />
          )}
          {statusText && (
            <p className="min-w-0 truncate text-xs leading-4 text-ink-muted lg:text-[13px] lg:leading-[18px]">
              {statusText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PresenceIdentityExpanded({
  user,
  status,
  primaryGuild,
  customStatus,
  badges,
  bio,
}: PresenceIdentityProps) {
  const hasStatus = Boolean(
    customStatus && (customStatus.text ?? customStatus.emojiName),
  );

  return (
    <div className="flex flex-col gap-3 lg:gap-3.5">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2 lg:gap-2.5">
          <h2 className="max-w-full text-2xl leading-[30px] font-bold tracking-[-0.02em] text-(--cft-hi) lg:text-[26px] lg:leading-8">
            <DisplayName
              name={user.displayName}
              styles={user.displayNameStyles}
            />
          </h2>
          {primaryGuild && (
            <GuildTag primaryGuild={primaryGuild} compact={false} />
          )}
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-[5px] lg:gap-1.5">
              {badges.map((badge) => (
                <DiscordBadge
                  key={badge.id}
                  badge={badge}
                  className="size-5 lg:size-[22px]"
                />
              ))}
            </div>
          ) : (
            <UserFlagBadges publicFlags={user.publicFlags} />
          )}
        </div>
        <p className="text-sm leading-[18px] text-(--cft-mid) lg:text-[15px] lg:leading-5">
          @{user.username}
          <span className="lg:hidden"> · {STATUS_LABEL[status]}</span>
        </p>
      </div>

      {customStatus && hasStatus && (
        <div className="flex max-w-max items-start gap-2 rounded-[18px] bg-(--cft-status-bg) py-[7px] pr-3.5 pl-[7px] lg:items-center lg:gap-2.5 lg:rounded-[23px] lg:py-2 lg:pr-[18px] lg:pl-2">
          <StatusEmoji
            customStatus={customStatus}
            className="size-[26px] text-xl lg:size-[30px] lg:text-2xl"
          />
          {customStatus.text && (
            <p className="max-w-[250px] text-sm leading-5 text-(--cft-hi) italic lg:max-w-none lg:text-[15px]">
              {customStatus.text}
            </p>
          )}
        </div>
      )}

      <BioMarkdown bio={bio} />
    </div>
  );
}

export default function PresenceIdentity(props: PresenceIdentityProps) {
  const { compact = false } = props;
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={compact ? 'compact' : 'expanded'}
        layout
        className={compact ? 'min-w-0 flex-1' : undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : DUR_MICRO, ease: EASE_OUT }}
      >
        {compact ? (
          <PresenceIdentityCompact {...props} />
        ) : (
          <PresenceIdentityExpanded {...props} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
