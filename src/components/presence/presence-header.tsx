import Image from 'next/image';
import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import type { NormalizedPresence } from '@/lib/lanyard.shared';
import { hideOnError } from '@/components/ui/hide-on-error';
import StatusBubble from '@/components/presence/status-bubble';
import StatusDot from '@/components/presence/status-dot';
import { LAYOUT_TRANSITION } from '@/components/reveal/timing';

interface PresenceHeaderProps {
  user: NormalizedPresence['user'];
  status: NormalizedPresence['status'];
  customStatus: NormalizedPresence['customStatus'];
  discordUserId: string | undefined;
  accentColor: string | null;
  compact?: boolean;
}

export default function PresenceHeader({
  user,
  status,
  customStatus,
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
          : '-mt-13 flex items-start lg:-mt-16'
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
            ? 'relative size-12 shrink-0'
            : 'relative size-26 shrink-0 lg:size-32'
        }
      >
        <motion.div
          layout
          transition={LAYOUT_TRANSITION}
          className={
            compact
              ? 'relative z-10 size-full rounded-full bg-surface-raised'
              : 'relative z-10 size-full rounded-full border-[6px] border-(--cft-ring) bg-(--cft-ring) lg:border-[7px]'
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
          <div className="pointer-events-none absolute -inset-3 z-20 lg:-inset-3.5">
            <Image
              src={user.avatarDecorationUrl}
              alt=""
              fill
              sizes="(max-width: 1024px) 128px, 160px"
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
                ? 'size-4 border-[3px]'
                : 'size-6.5 border-[5px] lg:size-7'
            }
          />
        </div>
      </motion.div>

      {!compact && (
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 self-stretch pl-6 lg:flex-row lg:justify-between lg:gap-3">
          <div className="mt-8 min-w-0 lg:mt-11">
            <StatusBubble customStatus={customStatus} />
          </div>
          <a
            href={`https://discord.com/users/${discordUserId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto ml-auto shrink-0 rounded-[10px] px-3.5 py-2 text-[13px] leading-4.5 font-semibold text-white transition-[opacity,transform] duration-150 hover:opacity-85 active:scale-[0.97] lg:px-4 lg:text-sm lg:leading-5"
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
