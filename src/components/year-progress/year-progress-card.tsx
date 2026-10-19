const DAY_IN_MS = 86_400_000;
const SEGMENTS = 10;

function getYearProgress(now = new Date()) {
  const year = now.getFullYear();
  const start = Date.UTC(year, 0, 1);
  const today = Date.UTC(year, now.getMonth(), now.getDate());
  const end = Date.UTC(year + 1, 0, 1);
  const daysInYear = Math.round((end - start) / DAY_IN_MS);
  const dayOfYear = Math.floor((today - start) / DAY_IN_MS) + 1;
  const fraction = dayOfYear / daysInYear;

  return {
    year,
    daysInYear,
    dayOfYear,
    percent: Math.round(fraction * 100),
    filledSegments: Math.round(fraction * SEGMENTS),
  };
}

export default function YearProgressCard() {
  const { year, daysInYear, dayOfYear, percent, filledSegments } =
    getYearProgress();

  return (
    <section
      aria-label={`${year} progress`}
      className="flex h-33 items-center justify-between rounded-tile bg-surface px-6 py-[22px] lg:h-48 lg:p-6"
    >
      <div className="flex h-full flex-col justify-between">
        <p className="text-xs leading-4 font-medium text-ink-muted">
          {year} · Day {dayOfYear} of {daysInYear}
        </p>
        <p className="flex items-baseline">
          <span className="text-[72px] leading-16 font-bold tracking-[-0.05em] text-ink lg:text-[88px] lg:leading-[80px]">
            {percent}
          </span>
          <span className="text-[28px] leading-8 font-bold tracking-[-0.02em] text-(--theme-accent-ink,#7c8cff) lg:text-[32px] lg:leading-9">
            %
          </span>
        </p>
      </div>
      <div
        aria-hidden="true"
        className="flex w-11 shrink-0 flex-col gap-[3px] lg:w-12 lg:gap-1"
      >
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <span
            key={index}
            className={`h-[9px] rounded-xs lg:h-2.5 lg:rounded-[3px] ${
              index < filledSegments
                ? 'bg-(--theme-accent-ink,#7c8cff)'
                : 'bg-[#232733]'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
