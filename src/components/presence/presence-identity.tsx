import Image from 'next/image'
import { UserRoundSearch } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { NormalizedPresence } from '@/lib/lanyard.shared'
import type { DiscordProfileBadge } from '@/lib/discord-profile.shared'
import DiscordBadge from '@/components/presence/discord-badge'
import UserFlagBadges from '@/components/presence/user-flag-badges'
import BioMarkdown from '@/components/presence/bio-markdown'
import { DUR_MICRO, EASE_OUT } from '@/components/reveal/timing'

interface PresenceIdentityProps {
  user: NormalizedPresence['user']
  primaryGuild: NormalizedPresence['primaryGuild']
  customStatus: NormalizedPresence['customStatus']
  badges: DiscordProfileBadge[]
  bio: string
  discordUserId: string | undefined
  accentColor: string | null
  compact?: boolean
  listeningToSpotify?: boolean
}

function PresenceIdentityCompact({
  user,
  primaryGuild,
  customStatus,
  listeningToSpotify = false,
}: PresenceIdentityProps) {
  const statusText = customStatus?.text ?? customStatus?.emojiName ?? null

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <h2 className="truncate text-sm font-semibold leading-tight text-(--cft-hi)">
          {user.displayName}
        </h2>
        {primaryGuild && (
          <span className="flex shrink-0 items-center gap-1 rounded bg-(--cft-badge-bg) px-1.5 py-0.5 text-[10px] font-black tracking-widest text-(--cft-lo)">
            {primaryGuild.badgeUrl && (
              <Image
                src={primaryGuild.badgeUrl}
                alt=""
                width={10}
                height={10}
                className="h-2.5 w-2.5 rounded-sm"
                aria-hidden
              />
            )}
            {primaryGuild.tag}
          </span>
        )}
      </div>
      {statusText && (
        <p className="truncate text-xs text-(--cft-lo)">
          {listeningToSpotify && '♪ '}
          {statusText}
        </p>
      )}
    </div>
  )
}

function PresenceIdentityExpanded({
  user,
  primaryGuild,
  customStatus,
  badges,
  bio,
  discordUserId,
  accentColor,
}: PresenceIdentityProps) {
  return (
    <div className="flex gap-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-1 flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-(--cft-hi) leading-tight">
              {user.displayName}
            </h2>
            {primaryGuild && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-(--cft-badge-bg) text-xs font-black text-(--cft-lo) tracking-widest mt-1">
                {primaryGuild.badgeUrl && (
                  <Image
                    src={primaryGuild.badgeUrl}
                    alt=""
                    width={12}
                    height={12}
                    className="w-3 h-3 rounded-sm"
                    aria-hidden
                  />
                )}
                {primaryGuild.tag}
              </span>
            )}
            {badges.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {badges.map((badge) => (
                  <DiscordBadge key={badge.id} badge={badge} />
                ))}
              </div>
            ) : (
              <UserFlagBadges publicFlags={user.publicFlags} />
            )}
          </div>
          <p className="text-sm text-(--cft-lo)">@{user.username}</p>
        </div>
        <a
          href={`https://discord.com/users/${discordUserId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80 mt-0.5"
          style={{ backgroundColor: accentColor ? `${accentColor}99` : '#27272a' }}
        >
          <UserRoundSearch className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">View User</span>
        </a>
      </div>
      {customStatus && (customStatus.text ?? customStatus.emojiName) && (
        <div className='bg-(--cft-status-bg) px-2 py-1 rounded-xl max-w-max shadow-lg my-1'>
          <p className="text-xs text-(--cft-lo) mt-0.5 flex items-center gap-2">
            {customStatus.emojiUrl ? (
              <Image
                src={customStatus.emojiUrl}
                alt={customStatus.emojiName ?? ''}
                width={24}
                height={24}
                className="w-6 h-6 shrink-0"
                loading='lazy'
                unoptimized
              />
            ) : customStatus.emojiName ? (
              <span>{customStatus.emojiName}</span>
            ) : null}
            {customStatus.text && (
              <span className="italic text-sm">{customStatus.text}</span>
            )}
          </p>
        </div>
      )}

      <BioMarkdown bio={bio} />
    </div>
  )
}

export default function PresenceIdentity(props: PresenceIdentityProps) {
  const { compact = false } = props
  const reduceMotion = useReducedMotion() ?? false

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
        {compact ? <PresenceIdentityCompact {...props} /> : <PresenceIdentityExpanded {...props} />}
      </motion.div>
    </AnimatePresence>
  )
}
