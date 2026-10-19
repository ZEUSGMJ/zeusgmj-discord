const TILE = 'rounded-[28px] bg-surface lg:rounded-tile';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-raised ${className}`} />;
}

export function ProfileCardSkeleton() {
  return (
    <div className={`h-full min-h-96 animate-pulse overflow-hidden ${TILE}`}>
      <div className="h-[132px] bg-surface-raised lg:h-56" />
    </div>
  );
}

export function LinksCardSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-2 lg:grid-cols-5 lg:gap-3">
      {[0, 1, 2, 3, 4].map((item) => (
        <li
          key={item}
          className={`flex h-14 items-center gap-2.5 rounded-[20px] bg-surface px-3.5 lg:h-[72px] lg:gap-3.5 lg:rounded-3xl lg:px-5 ${
            item === 4 ? 'col-span-2 lg:col-span-1' : ''
          }`}
        >
          <Skeleton className="size-8 shrink-0 rounded-full lg:size-10" />
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
  return <div className={`h-33 animate-pulse lg:h-57 ${TILE}`} />;
}

export function SpotifyCardSkeleton() {
  return (
    <div className={`flex-1 p-[22px] lg:p-7 ${TILE}`}>
      <Skeleton className="mb-4 h-3 w-32 rounded" />
      <div className="mb-4 flex items-center gap-3.5 lg:gap-4">
        <Skeleton className="size-24 shrink-0 rounded-xl lg:size-35" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
      <ul className="space-y-2.5 lg:space-y-3">
        {[0, 1, 2, 3].map((item) => (
          <li key={item} className="flex items-center gap-3">
            <Skeleton className="h-3 w-[18px] shrink-0 rounded" />
            <Skeleton className="size-10 shrink-0 rounded-md lg:size-11" />
            <Skeleton className="h-3 w-28 rounded" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SteamCardSkeleton() {
  return (
    <div className={`h-full p-[22px] lg:min-h-[400px] lg:p-7 ${TILE}`}>
      <Skeleton className="mb-4 h-3 w-36 rounded" />
      <div className="flex items-end gap-3 lg:gap-4">
        <Skeleton className="h-[195px] w-[130px] shrink-0 rounded-xl lg:h-[260px] lg:w-[200px] lg:rounded-[14px]" />
        <Skeleton className="h-[120px] w-20 shrink-0 rounded-[10px] lg:h-[195px] lg:w-[150px] lg:rounded-xl" />
        <Skeleton className="h-[120px] w-20 shrink-0 rounded-[10px] lg:h-[195px] lg:w-[150px] lg:rounded-xl" />
      </div>
    </div>
  );
}

export function MediaCardSkeleton() {
  return (
    <div className={`h-full p-[22px] lg:min-h-[400px] lg:p-7 ${TILE}`}>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-8 w-40 rounded-full" />
      </div>
      <div className="flex gap-2.5 lg:gap-3">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            className={`h-[150px] min-w-0 flex-1 rounded-[10px] lg:h-[232px] lg:rounded-xl ${
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
      <div className="w-full max-w-[1200px]">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
          <div className="lg:col-span-7">
            <ProfileCardSkeleton />
          </div>
          <div className="flex h-full flex-col gap-3 lg:col-span-5 lg:gap-4">
            <YearProgressCardSkeleton />
            <SpotifyCardSkeleton />
          </div>
          <div className="lg:col-span-12">
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
