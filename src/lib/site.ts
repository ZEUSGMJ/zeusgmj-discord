import 'server-only'

function parseUrl(value: string): URL {
  return new URL(value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`)
}

export function getSiteUrl(): URL {
  const explicit = process.env.SITE_URL?.trim()
  if (explicit) {
    return parseUrl(explicit)
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
  if (vercelUrl) {
    return parseUrl(vercelUrl)
  }

  return new URL('http://localhost:3000')
}
