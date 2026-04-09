import 'server-only'

import type { LanyardData } from '@/lib/lanyard.shared'

export async function fetchLanyard(userId: string): Promise<LanyardData> {
  const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Lanyard fetch failed: ${response.status}`)
  }

  const json = await response.json()
  if (!json.success) {
    throw new Error('Lanyard returned success:false')
  }

  return json.data as LanyardData
}
