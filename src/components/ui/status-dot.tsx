interface StatusDotProps {
  status: 'online' | 'idle' | 'dnd' | 'offline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const colorMap = {
  online: 'bg-green-400 ring-green-400/30',
  idle: 'bg-yellow-400 ring-yellow-400/30',
  dnd: 'bg-red-500 ring-red-500/30',
  offline: 'bg-zinc-500',
}

const sizeMap = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
  xl: 'w-6 h-6',
}

const labelMap = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline',
}

export default function StatusDot({ status, size = 'md', className = '' }: StatusDotProps) {
  return (
    <span
      className={`inline-block rounded-full ring-4 ring-zinc-900 ring-offset-2 ring-offset-zinc-900 ${colorMap[status]} ${sizeMap[size]} ${className}`}
      title={labelMap[status]}
      aria-label={labelMap[status]}
    />
  )
}
