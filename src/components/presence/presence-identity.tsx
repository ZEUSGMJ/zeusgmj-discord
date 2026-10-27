import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { hasCustomStatus, type NormalizedPresence } from '@/lib/lanyard.shared';
import type { DiscordProfileBadge } from '@/lib/discord-profile.shared';
import DiscordBadge from '@/components/presence/discord-badge';
import DisplayName from '@/components/presence/display-name';
import StatusEmoji from '@/components/presence/status-emoji';
import { hideOnError } from '@/components/ui/hide-on-error';
import UserFlagBadges from '@/components/presence/user-flag-badges';
import BioMarkdown from '@/components/presence/bio-markdown';
import MemberSince from '@/components/presence/member-since';
import {
  ActivityGlyph,
  LABEL_CLASS,
  carouselItemLabel,
  type CarouselItem,
} from '@/components/presence/activity-row';
import {
  CONTENT_ENTER_TRANSITION,
  DUR_CARD_EXIT,
  EASE_OUT,
} from '@/components/reveal/timing';

interface PresenceIdentityProps {
  user: NormalizedPresence['user'];
  primaryGuild: NormalizedPresence['primaryGuild'];
  customStatus: NormalizedPresence['customStatus'];
  badges: DiscordProfileBadge[];
  bio: string;
  bioFromDiscord: boolean;
  liveActivity: CarouselItem | null;
  compact?: boolean;
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      className="h-2.5 w-px shrink-0 rounded-full bg-(--cft-dim)/70"
    />
  );
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
  liveActivity,
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
      {(liveActivity || hasStatus) && (
        <div className="flex min-w-0 items-center gap-1.5 lg:gap-2">
          {liveActivity && (
            <span
              title={carouselItemLabel(liveActivity)}
              className="flex shrink-0 items-center rounded-[5px] bg-online/16 px-[5px] py-0.5 text-[#46d68c]"
            >
              <ActivityGlyph
                item={liveActivity}
                aria-label={carouselItemLabel(liveActivity)}
                className="size-3"
              />
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
  primaryGuild,
  badges,
  bio,
  bioFromDiscord,
}: PresenceIdentityProps) {
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
        <div className="flex flex-wrap items-center gap-x-2.5 text-sm leading-[18px] text-(--cft-mid)">
          <span className="wrap-anywhere">@{user.username}</span>
          <Divider />
          <MemberSince userId={user.id} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 lg:gap-2">
        {bioFromDiscord && <p className={LABEL_CLASS}>Discord Bio</p>}
        <div className="rounded-xl bg-(--cft-panel-bg) px-3.5 py-3 lg:px-4 lg:py-3.5">
          <BioMarkdown bio={bio} />
        </div>
      </div>
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
