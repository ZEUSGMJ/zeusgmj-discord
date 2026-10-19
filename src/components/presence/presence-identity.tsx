import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { hasCustomStatus, type NormalizedPresence } from '@/lib/lanyard.shared';
import { SiDiscord } from 'react-icons/si';
import {
  memberSince,
  type DiscordProfileBadge,
} from '@/lib/discord-profile.shared';
import DiscordBadge from '@/components/presence/discord-badge';
import DisplayName from '@/components/presence/display-name';
import StatusEmoji from '@/components/presence/status-emoji';
import { STATUS_COLOR, STATUS_LABEL } from '@/components/presence/status-dot';
import { hideOnError } from '@/components/ui/hide-on-error';
import UserFlagBadges from '@/components/presence/user-flag-badges';
import BioMarkdown from '@/components/presence/bio-markdown';
import {
  CONTENT_ENTER_TRANSITION,
  DUR_CARD_EXIT,
  EASE_OUT,
} from '@/components/reveal/timing';

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
          ? 'flex shrink-0 items-center gap-1 rounded-md bg-white/8 py-0.5 pr-1.5 pl-1 text-[10px] leading-3 font-extrabold tracking-[0.06em] text-ink'
          : 'flex shrink-0 items-center gap-1 rounded-md bg-[#0a0a19]/50 px-2 py-0.5 text-[11px] leading-4 font-bold tracking-[0.04em] text-(--cft-hi)'
      }
    >
      {primaryGuild.badgeUrl && (
        <Image
          src={primaryGuild.badgeUrl}
          alt=""
          width={24}
          height={24}
          className={
            compact ? 'size-2.5 rounded-[3px]' : 'size-3 rounded-[3px]'
          }
          aria-hidden
          onError={hideOnError}
        />
      )}
      {primaryGuild.tag}
    </span>
  );
}

function PresenceIdentityCompact({
  user,
  primaryGuild,
  customStatus,
  badges,
  activityCount,
}: PresenceIdentityProps) {
  const statusText = customStatus?.text ?? null;
  const hasStatus = hasCustomStatus(customStatus);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
      <div className="flex min-w-0 items-center gap-1.5 lg:gap-2">
        <h2 className="min-w-0 text-[22px] leading-8 font-bold tracking-[-0.02em] text-ink lg:text-xl lg:leading-7">
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
            className="size-3.5 shrink-0 max-[379px]:hidden"
          />
        ))}
      </div>
      {(activityCount > 0 || hasStatus) && (
        <div className="flex min-w-0 items-center gap-1.5 lg:gap-2">
          {activityCount > 0 && (
            <span className="shrink-0 rounded-[5px] bg-online/16 px-[5px] py-px text-[10px] leading-3.5 font-bold text-[#46d68c]">
              +{activityCount}
            </span>
          )}
          {customStatus && (
            <StatusEmoji
              customStatus={customStatus}
              className="size-3 text-[10px] lg:size-3.5"
            />
          )}
          {statusText && (
            <p
              title={statusText}
              className="min-w-0 truncate text-xs leading-4 text-ink-muted"
            >
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
  badges,
  bio,
}: PresenceIdentityProps) {
  const since = memberSince(user.id);

  return (
    <div className="flex flex-col gap-3 lg:gap-3.5">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2 lg:gap-2.5">
          <h2 className="max-w-full text-2xl leading-[30px] font-bold tracking-[-0.02em] text-(--cft-hi) lg:text-[22px] lg:leading-7">
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
                <DiscordBadge key={badge.id} badge={badge} className="size-5" />
              ))}
            </div>
          ) : (
            <UserFlagBadges publicFlags={user.publicFlags} />
          )}
        </div>
        <p className="flex flex-wrap items-center gap-x-1.5 text-sm leading-[18px] text-(--cft-mid)">
          <span className="wrap-anywhere">@{user.username}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`inline-block size-2 rounded-full ${STATUS_COLOR[status]}`}
            />
            {STATUS_LABEL[status]}
          </span>
          {since && (
            <>
              <span aria-hidden="true">·</span>
              <span
                className="inline-flex items-center gap-1.5"
                title={`Discord member since ${since}`}
              >
                <SiDiscord aria-hidden="true" className="size-3.5 shrink-0" />
                {since}
              </span>
            </>
          )}
        </p>
      </div>

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
        animate={{
          opacity: 1,
          transition: reduceMotion ? { duration: 0 } : CONTENT_ENTER_TRANSITION,
        }}
        exit={{
          opacity: 0,
          transition: {
            duration: reduceMotion ? 0 : DUR_CARD_EXIT,
            ease: EASE_OUT,
          },
        }}
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
