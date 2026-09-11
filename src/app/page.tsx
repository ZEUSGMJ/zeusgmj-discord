import { Suspense } from 'react';
import ProfilePresenceCard from '@/components/presence/profile-presence-card';
import SpotifyCard from '@/components/spotify-card';
import SteamCard from '@/components/steam-card';
import MediaCardWrapper from '@/components/media/media-card-wrapper';
import LinksCard from '@/components/links-card';
import { PresenceProvider } from '@/components/presence/presence-provider';
import FooterBackground from '@/components/footer/footer-background';
import { RevealProvider } from '@/components/reveal/reveal-context';
import RevealStage from '@/components/reveal/reveal-stage';
import YearProgressCard from '@/components/year-progress/year-progress-card';
import CardErrorBoundary from '@/components/ui/card-error-boundary';
import {
  MediaCardSkeleton,
  SpotifyCardSkeleton,
  SteamCardSkeleton,
} from '@/components/ui/home-card-skeletons';

export default function Home() {
  return (
    <>
      <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4 py-12 sm:px-6 lg:px-8">
        <RevealProvider>
          <PresenceProvider>
            <div className="relative z-10 w-full max-w-4xl">
              <RevealStage
                presence={
                  <CardErrorBoundary title="Presence">
                    <ProfilePresenceCard />
                  </CardErrorBoundary>
                }
                links={
                  <CardErrorBoundary title="Links">
                    <LinksCard />
                  </CardErrorBoundary>
                }
                yearProgress={
                  <CardErrorBoundary title="Year Progress">
                    <YearProgressCard />
                  </CardErrorBoundary>
                }
                tracks={
                  <CardErrorBoundary title="Top Tracks">
                    <Suspense fallback={<SpotifyCardSkeleton />}>
                      <SpotifyCard />
                    </Suspense>
                  </CardErrorBoundary>
                }
                games={
                  <CardErrorBoundary title="Recent Games">
                    <Suspense fallback={<SteamCardSkeleton />}>
                      <SteamCard />
                    </Suspense>
                  </CardErrorBoundary>
                }
                media={
                  <CardErrorBoundary title="Media">
                    <Suspense fallback={<MediaCardSkeleton />}>
                      <MediaCardWrapper />
                    </Suspense>
                  </CardErrorBoundary>
                }
              />
            </div>
            <FooterBackground />
          </PresenceProvider>
        </RevealProvider>
      </main>
    </>
  );
}
