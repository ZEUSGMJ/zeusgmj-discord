import { getRecentlyPlayed } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

export async function GET() {
  const tracks = await getRecentlyPlayed()
  return Response.json(tracks)
}
