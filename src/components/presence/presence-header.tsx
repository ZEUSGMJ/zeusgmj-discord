import Image from 'next/image';
import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import type { NormalizedPresence } from '@/lib/lanyard.shared';
import { hideOnError } from '@/components/ui/hide-on-error';
import StatusDot, { STATUS_LABEL } from '@/components/presence/status-dot';
import { LAYOUT_TRANSITION } from '@/components/reveal/timing';

const statusBadge: Record<NormalizedPresence['status'], string> = {
  online: 'bg-[#17302a] text-[#46d68c]',
  idle: 'bg-yellow-950/60 text-yellow-400',
  dnd: 'bg-red-950/60 text-red-400',
  offline: 'bg-zinc-800 text-zinc-400',
};

interface PresenceHeaderProps {
  user: NormalizedPresence['user'];
  status: NormalizedPresence['status'];
  discordUserId: string | undefined;
  accentColor: string | null;
  compact?: boolean;
}

export default function PresenceHeader({
  user,
  status,
  discordUserId,
  accentColor,
  compact = false,
}: PresenceHeaderProps) {
  return (
    <motion.div
      layout
      transition={LAYOUT_TRANSITION}
      className={
        compact
          ? 'flex shrink-0 items-center'
          : '-mt-[52px] flex items-end justify-between lg:-mt-[72px]'
      }
    >
      <motion.div
        layout
        transition={LAYOUT_TRANSITION}
        style={
          {
            '--dot-ring': compact ? 'var(--color-surface)' : 'var(--cft-ring)',
          } as CSSProperties
        }
        className={
          compact
            ? 'relative size-12 shrink-0 lg:size-13'
            : 'relative size-26 shrink-0 lg:size-36'
        }
      >
        <motion.div
          layout
          transition={LAYOUT_TRANSITION}
          className={
            compact
              ? 'relative z-10 size-full rounded-full bg-surface-raised'
              : 'relative z-10 size-full rounded-full border-[6px] border-(--cft-ring) bg-(--cft-ring) lg:border-8'
          }
        >
          <Image
            src={user.avatarUrl}
            alt={user.displayName}
            width={512}
            height={512}
            className="size-full rounded-full"
            preload
            unoptimized={user.avatarUrl.includes('animated=true')}
          />
        </motion.div>
        {!compact && user.avatarDecorationUrl && (
          <div className="pointer-events-none absolute -inset-3 z-20 lg:-inset-4">
            <Image
              src={user.avatarDecorationUrl}
              alt=""
              fill
              sizes="(max-width: 1024px) 128px, 176px"
              className="object-contain"
              aria-hidden={true}
              onError={hideOnError}
            />
          </div>
        )}
        <div
          className={
            compact
              ? 'absolute -right-0.5 -bottom-0.5 z-30'
              : 'absolute right-0 bottom-0 z-30 lg:right-0.5 lg:bottom-0.5'
          }
        >
          <StatusDot
            status={status}
            className={
              compact
                ? 'size-4 border-[3px] lg:size-[18px] lg:border-4'
                : 'size-[26px] border-[5px] lg:size-8 lg:border-[6px]'
            }
          />
        </div>
      </motion.div>

      {!compact && (
        <div className="flex flex-col items-end gap-1.5 lg:gap-2">
          <span
            className={`hidden rounded-full px-3.5 py-1 text-[13px] leading-[18px] font-semibold lg:block ${statusBadge[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
          <a
            href={`https://discord.com/users/${discordUserId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[10px] px-3.5 py-2 text-[13px] leading-[18px] font-semibold text-white transition-[opacity,transform] duration-150 hover:opacity-85 active:scale-[0.97] lg:px-[18px] lg:py-[9px] lg:text-[15px] lg:leading-5"
            style={{
              backgroundColor: accentColor ? `${accentColor}99` : '#27272a',
            }}
          >
            View User
          </a>
        </div>
      )}
    </motion.div>
  );
}
