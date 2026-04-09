import Image from 'next/image'
import type { DiscordProfileBadge } from '@/lib/discord-profile.shared'

export default function DiscordBadge({ badge }: { badge: DiscordProfileBadge }) {
  const img = (
    <Image
      src={`https://cdn.discordapp.com/badge-icons/${badge.icon}.png`}
      alt={badge.description}
      width={20}
      height={20}
      title={badge.description}
      className="w-5 h-5"
    />
  )

  if (badge.link) {
    return (
      <a href={badge.link} target="_blank" rel="noopener noreferrer" title={badge.description}>
        {img}
      </a>
    )
  }

  return img
}
