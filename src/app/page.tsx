import { Suspense } from 'react'
import ProfilePresenceCard from '@/components/profile-presence-card'
import SpotifyCard from '@/components/spotify-card'
import SteamCard from '@/components/steam-card'
import MediaCardWrapper from '@/components/media-card-wrapper'
import LinksCard from '@/components/links-card'
import CardErrorBoundary from '@/components/ui/card-error-boundary'
import {
  MediaCardSkeleton,
  SpotifyCardSkeleton,
  SteamCardSkeleton,
} from '@/components/ui/home-card-skeletons'

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2">
            <CardErrorBoundary title="Presence">
              <ProfilePresenceCard />
            </CardErrorBoundary>
          </div>

          <CardErrorBoundary title="Links">
            <LinksCard />
          </CardErrorBoundary>

          <CardErrorBoundary title="Top Tracks">
            <Suspense fallback={<SpotifyCardSkeleton />}>
              <SpotifyCard />
            </Suspense>
          </CardErrorBoundary>

          <CardErrorBoundary title="Recent Games">
            <Suspense fallback={<SteamCardSkeleton />}>
              <SteamCard />
            </Suspense>
          </CardErrorBoundary>

          <CardErrorBoundary title="Media">
            <Suspense fallback={<MediaCardSkeleton />}>
              <MediaCardWrapper />
            </Suspense>
          </CardErrorBoundary>
        </div>
      </div>
    </main>
  )
}
