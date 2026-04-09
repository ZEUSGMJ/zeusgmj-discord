export function ProfileCardSkeleton() {
  return (
    <div className="h-full min-h-52 rounded-3xl border border-zinc-800/50 bg-zinc-900 animate-pulse" />
  )
}

export function LinksCardSkeleton() {
  return (
    <div className="h-full rounded-3xl border border-zinc-800/50 bg-zinc-900 p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="h-3 w-12 rounded bg-zinc-800 animate-pulse" />
        <div className="h-4 w-4 rounded bg-zinc-800 animate-pulse" />
      </div>
      <ul className="space-y-2">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <li key={item} className="flex items-center justify-between rounded-xl py-2.5">
            <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse" />
            <div className="h-3 w-16 rounded bg-zinc-800 animate-pulse" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SpotifyCardSkeleton() {
  return (
    <div className="h-full rounded-3xl border border-zinc-800/50 bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-3 w-36 rounded bg-zinc-800 animate-pulse" />
        <div className="h-4 w-4 rounded bg-zinc-800 animate-pulse" />
      </div>
      <ol className="space-y-3">
        {[0, 1, 2, 3, 4].map((item) => (
          <li key={item} className="flex items-center gap-3">
            <div className="h-3 w-4 rounded bg-zinc-800 animate-pulse shrink-0" />
            <div className="h-10 w-10 rounded-xs bg-zinc-800 animate-pulse shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-3 w-28 rounded bg-zinc-800 animate-pulse" />
              <div className="h-2 w-16 rounded bg-zinc-800 animate-pulse" />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function SteamCardSkeleton() {
  return (
    <div className="h-full rounded-3xl border border-zinc-800/50 bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-3 w-28 rounded bg-zinc-800 animate-pulse" />
        <div className="h-4 w-4 rounded bg-zinc-800 animate-pulse" />
      </div>
      <ul className="space-y-3">
        {[0, 1, 2, 3, 4].map((item) => (
          <li key={item} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-zinc-800 animate-pulse shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-3 w-32 rounded bg-zinc-800 animate-pulse" />
              <div className="h-2 w-20 rounded bg-zinc-800 animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MediaCardSkeleton() {
  return (
    <div className="h-full rounded-3xl border border-zinc-800/50 bg-zinc-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-3 w-12 rounded bg-zinc-800 animate-pulse" />
        <div className="h-4 w-4 rounded bg-zinc-800 animate-pulse" />
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-20 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-4 w-16 rounded bg-zinc-800 animate-pulse" />
      </div>
      <ul className="space-y-3">
        {[0, 1, 2, 3, 4].map((item) => (
          <li key={item} className="flex gap-3">
            <div className="h-14 w-10 rounded-lg bg-zinc-800 animate-pulse shrink-0" />
            <div className="flex flex-col justify-center gap-1.5">
              <div className="h-3 w-28 rounded bg-zinc-800 animate-pulse" />
              <div className="h-2 w-16 rounded bg-zinc-800 animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HomePageLoadingGrid() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2">
            <ProfileCardSkeleton />
          </div>
          <LinksCardSkeleton />
          <SpotifyCardSkeleton />
          <SteamCardSkeleton />
          <MediaCardSkeleton />
        </div>
      </div>
    </main>
  )
}
