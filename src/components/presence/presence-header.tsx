import Image from 'next/image'
import type { NormalizedPresence } from '@/lib/lanyard.shared'
import StatusDot from '@/components/presence/status-dot'

const statusLabel: Record<NormalizedPresence['status'], string> = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline',
}

const statusBadge: Record<NormalizedPresence['status'], string> = {
  online: 'bg-green-950/60 text-green-400',
  idle: 'bg-yellow-950/60 text-yellow-400',
  dnd: 'bg-red-950/60 text-red-400',
  offline: 'bg-zinc-800 text-zinc-500',
}

export default function PresenceHeader({
  user,
  status,
}: {
  user: NormalizedPresence['user']
  status: NormalizedPresence['status']
}) {
  return (
    <div className="-mt-16 flex items-end justify-between">
      <div className="relative size-32 shrink-0">
        <div className="relative z-10 size-32 rounded-full bg-zinc-900 ring-8 ring-zinc-900">
          <Image
            src={user.avatarUrl}
            alt={user.displayName}
            width={512}
            height={512}
            className="size-32 rounded-full"
            preload
            unoptimized={user.avatarUrl.includes('animated=true')}
          />
        </div>
        {user.avatarDecorationUrl && (
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
        <div className="absolute bottom-0.5 right-0.5 z-30">
          <StatusDot status={status} size="xl" />
        </div>
      </div>

      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[status]}`}>
        {statusLabel[status]}
      </span>
    </div>
  )
}
