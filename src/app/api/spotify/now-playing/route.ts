import { getCurrentlyPlaying } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET() {
  const track = await getCurrentlyPlaying();
  if (track === null) {
    return new Response(null, { status: 204 });
  }
  return Response.json(track);
}
