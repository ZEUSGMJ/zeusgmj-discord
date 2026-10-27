const TILE = 'rounded-tile bg-surface';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-raised ${className}`} />;
}

export function ProfileCardSkeleton() {
  return (
    <div className={`h-full min-h-96 animate-pulse overflow-hidden ${TILE}`}>
      <div className="h-33 bg-surface-raised lg:h-48" />
    </div>
  );
}

export function LinksCardSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-2 lg:grid-cols-5 lg:gap-3">
      {[0, 1, 2, 3, 4].map((item) => (
        <li
          key={item}
          className={`flex h-14 items-center gap-2.5 rounded-[20px] bg-surface px-3.5 lg:h-16 lg:gap-3 lg:rounded-[22px] lg:px-4 ${
            item === 4 ? 'col-span-2 lg:col-span-1' : ''
          }`}
        >
          <Skeleton className="size-8 shrink-0 rounded-full lg:size-9" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-2 w-24 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function YearProgressCardSkeleton() {
  return <div className={`h-33 animate-pulse lg:h-48 ${TILE}`} />;
}

export function SpotifyCardSkeleton() {
  return (
    <div className={`flex-1 p-5.5 lg:p-6 ${TILE}`}>
      <Skeleton className="mb-4 h-3 w-32 rounded" />
      <div className="mb-4 flex items-center gap-3.5 lg:gap-4">
        <Skeleton className="size-24 shrink-0 rounded-xl lg:size-28" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
      <ul className="space-y-2.5 lg:space-y-3">
        {[0, 1, 2, 3].map((item) => (
          <li key={item} className="flex items-center gap-3">
            <Skeleton className="h-3 w-4.5 shrink-0 rounded" />
            <Skeleton className="size-10 shrink-0 rounded-md" />
            <Skeleton className="h-3 w-28 rounded" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SteamCardSkeleton() {
  return (
    <div className={`h-full p-5.5 lg:min-h-85 lg:p-6 ${TILE}`}>
      <Skeleton className="mb-4 h-3 w-36 rounded" />
      <div className="flex items-end gap-3 lg:gap-4">
        <Skeleton className="aspect-2/3 max-w-45 min-w-0 flex-[1.25_1_0%] rounded-xl lg:w-36.75 lg:max-w-none lg:flex-none lg:rounded-[14px]" />
        <Skeleton className="aspect-2/3 max-w-36 min-w-0 flex-[1_1_0%] rounded-[10px] lg:rounded-xl" />
        <Skeleton className="aspect-2/3 max-w-36 min-w-0 flex-[1_1_0%] rounded-[10px] lg:rounded-xl" />
      </div>
    </div>
  );
}

export function MediaCardSkeleton() {
  return (
    <div className={`h-full p-5.5 lg:min-h-85 lg:p-6 ${TILE}`}>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-8 w-40 rounded-full" />
      </div>
      <div className="flex gap-2.5 lg:gap-3">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            className={`h-37.5 min-w-0 flex-1 rounded-[10px] sm:aspect-2/3 sm:h-auto lg:aspect-auto lg:h-49 lg:rounded-xl ${
              item === 3 ? 'hidden lg:block' : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function HomePageLoadingGrid() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-260">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          <div className="sm:col-span-2 lg:col-span-7">
            <ProfileCardSkeleton />
          </div>
          <div className="flex h-full flex-col gap-3 sm:col-span-2 lg:col-span-5 lg:gap-4">
            <YearProgressCardSkeleton />
            <SpotifyCardSkeleton />
          </div>
          <div className="sm:col-span-2 lg:col-span-12">
            <LinksCardSkeleton />
          </div>
          <div className="lg:col-span-6">
            <SteamCardSkeleton />
          </div>
          <div className="lg:col-span-6">
            <MediaCardSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}
