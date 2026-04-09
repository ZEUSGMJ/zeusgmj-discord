import { getCurrentlyPlaying } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

export async function GET() {
  const track = await getCurrentlyPlaying()
  // null means nothing playing — return 204 to match Spotify's own convention
  if (track === null) {
    return new Response(null, { status: 204 })
  }
  return Response.json(track)
}
