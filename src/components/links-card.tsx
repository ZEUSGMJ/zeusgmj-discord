import { Link } from "lucide-react"

interface LinkItem {
  label: string
  href: string
  description: string
  external: boolean
}

const LINKS: LinkItem[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/ZEUSGMJ',
    description: 'Code & projects',
    external: true,
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com/zeusgmj',
    description: 'Mostly lurking',
    external: true,
  },
  {
    label: 'Spotify',
    href: 'https://open.spotify.com/user/wvckgj74wvfnyyzl8vtg6pwrr',
    description: 'I have some playlists',
    external: true,
  },
  {
    label: 'Steam',
    href: 'https://steamcommunity.com/id/ZEUSGMJ/',
    description: 'Too many hours',
    external: true,
  },
  {
    label: 'Stats.fm',
    href: 'https://stats.fm/zeusgmj',
    description: 'Obsessively tracked',
    external: true,
  }
]

export default function LinksCard() {
  return (
    <div className="rounded-3xl bg-zinc-900 border border-zinc-800/50 p-5 shine-edge">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
          Links
        </h3>
        <Link className="text-zinc-500 w-4 h-4" />
      </div>
      <ul className="space-y-1">
        {LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-zinc-800/70 transition-colors group"
            >
              <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                {link.label}
              </span>
              <span className="text-xs text-zinc-600 group-hover:text-zinc-500 transition-colors">
                {link.description}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
