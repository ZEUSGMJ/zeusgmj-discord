import Image from 'next/image';
import { motion } from 'motion/react';
import type { NormalizedPresence } from '@/lib/lanyard.shared';
import StatusDot from '@/components/presence/status-dot';
import { LAYOUT_TRANSITION } from '@/components/reveal/timing';

const statusLabel: Record<NormalizedPresence['status'], string> = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline',
};

const statusBadge: Record<NormalizedPresence['status'], string> = {
  online: 'bg-green-950/60 text-green-400',
  idle: 'bg-yellow-950/60 text-yellow-400',
  dnd: 'bg-red-950/60 text-red-400',
  offline: 'bg-zinc-800 text-zinc-500',
};

export default function PresenceHeader({
  user,
  status,
  compact = false,
}: {
  user: NormalizedPresence['user'];
  status: NormalizedPresence['status'];
  compact?: boolean;
}) {
  return (
    <motion.div
      layout
      transition={LAYOUT_TRANSITION}
      className={
        compact
          ? 'flex items-center gap-3'
          : '-mt-16 flex items-end justify-between'
      }
    >
      <motion.div
        layout
        transition={LAYOUT_TRANSITION}
        className={
          compact ? 'relative size-12 shrink-0' : 'relative size-32 shrink-0'
        }
      >
        <motion.div
          layout
          transition={LAYOUT_TRANSITION}
          className={
            compact
              ? 'relative z-10 size-12 rounded-full bg-zinc-900 ring-2 ring-zinc-900'
              : 'relative z-10 size-32 rounded-full bg-zinc-900 ring-8 ring-zinc-900'
          }
        >
          <Image
            src={user.avatarUrl}
            alt={user.displayName}
            width={512}
            height={512}
            className={
              compact ? 'size-12 rounded-full' : 'size-32 rounded-full'
            }
            preload
            unoptimized={user.avatarUrl.includes('animated=true')}
          />
        </motion.div>
        {!compact && user.avatarDecorationUrl && (
          <div className="pointer-events-none absolute -inset-4 z-20">
            <Image
              src={user.avatarDecorationUrl}
              alt=""
              fill
              sizes="160px"
              className="object-contain"
              aria-hidden={true}
            />
          </div>
        )}
        <div
          className={
            compact
              ? 'absolute right-0 bottom-0 z-30'
              : 'absolute right-0.5 bottom-0.5 z-30'
          }
        >
          <StatusDot status={status} size={compact ? 'sm' : 'xl'} />
        </div>
      </motion.div>

      {!compact && (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[status]}`}
        >
          {statusLabel[status]}
        </span>
      )}
    </motion.div>
  );
}
