import { fetchLanyard } from '@/lib/lanyard'
import { normalizeLanyard } from '@/lib/lanyard.shared'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = process.env.DISCORD_USER_ID
  if (!userId) {
    return Response.json(
      { error: 'DISCORD_USER_ID is not configured' },
      { status: 500 },
    )
  }

  try {
    const data = await fetchLanyard(userId)
    const normalized = normalizeLanyard(data)
    return Response.json(normalized)
  } catch (err) {
    console.error('[api/lanyard]', err)
    return Response.json(
      { error: 'Failed to fetch presence data' },
      { status: 502 },
    )
  }
}
