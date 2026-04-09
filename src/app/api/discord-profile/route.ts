import { fetchDiscordProfile } from '@/lib/discord-profile'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = process.env.DISCORD_USER_ID
  if (!userId) {
    return new Response('Missing DISCORD_USER_ID', { status: 500 })
  }

  try {
    const profile = await fetchDiscordProfile(userId)
    return Response.json(profile)
  } catch {
    return new Response('Failed to fetch Discord profile', { status: 502 })
  }
}
