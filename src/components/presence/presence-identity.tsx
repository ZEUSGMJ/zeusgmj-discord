import Image from 'next/image'
import { UserRoundSearch } from 'lucide-react'
import type { NormalizedPresence } from '@/lib/lanyard.shared'
import type { DiscordProfileBadge } from '@/lib/discord-profile.shared'
import DiscordBadge from '@/components/presence/discord-badge'
import UserFlagBadges from '@/components/presence/user-flag-badges'
import BioMarkdown from '@/components/presence/bio-markdown'

export default function PresenceIdentity({
  user,
  primaryGuild,
  customStatus,
  badges,
  bio,
  discordUserId,
  accentColor,
}: {
  user: NormalizedPresence['user']
  primaryGuild: NormalizedPresence['primaryGuild']
  customStatus: NormalizedPresence['customStatus']
  badges: DiscordProfileBadge[]
  bio: string
  discordUserId: string | undefined
  accentColor: string | null
}) {
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
