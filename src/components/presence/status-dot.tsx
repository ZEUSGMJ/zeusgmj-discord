interface StatusDotProps {
  status: 'online' | 'idle' | 'dnd' | 'offline';
  className?: string;
}

export const STATUS_COLOR: Record<StatusDotProps['status'], string> = {
  online: 'bg-online',
  idle: 'bg-yellow-400',
  dnd: 'bg-red-500',
  offline: 'bg-zinc-500',
};

export const STATUS_LABEL: Record<StatusDotProps['status'], string> = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline',
};

export default function StatusDot({
  status,
  className = 'size-4 border-[3px]',
}: StatusDotProps) {
  return (
    <span
      className={`inline-block rounded-full border-(--dot-ring) ${STATUS_COLOR[status]} ${className}`}
      title={STATUS_LABEL[status]}
      aria-label={STATUS_LABEL[status]}
    />
  );
}
