export interface YearProgressData {
  year: number
  daysInYear: number
  dayOfYear: number
  fraction: number
  percent: number
  monthIndex: number
  dayOfMonth: number
  daysInMonth: number
}

const COLS = 20
const ROWS = 15
const TOTAL_CELLS = COLS * ROWS
const DAY_IN_MS = 86_400_000
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const
export const YEAR_PROGRESS_VARIANTS = [
  'Matrix',
  'Orbit',
  'Months',
  'Quarters',
  'Columns',
  'Countdown',
  'Stripes',
  'Gauge',
  'Fraction',
  'Rings',
  'Calendar',
] as const

function getQuarterProgress(progress: YearProgressData) {
  const quarterIndex = Math.floor(progress.monthIndex / 3)
  const quarterStart = Date.UTC(progress.year, quarterIndex * 3, 1)
  const quarterEnd = Date.UTC(progress.year, (quarterIndex + 1) * 3, 1)
  const currentDay = Date.UTC(
    progress.year,
    progress.monthIndex,
    progress.dayOfMonth,
  )

  return {
    quarterIndex,
    fraction: Math.min(
      (currentDay - quarterStart + DAY_IN_MS) / (quarterEnd - quarterStart),
      1,
    ),
  }
}

function ProgressFooter({ progress }: { progress: YearProgressData }) {
  return (
    <div className="mt-3 flex items-baseline justify-between gap-3">
      <p className="text-2xl font-bold text-(--theme-accent)">{progress.percent}%</p>
      <p className="text-xs text-zinc-600">
        Day {progress.dayOfYear} of {progress.daysInYear}
      </p>
    </div>
  )
}

function MatrixDesign({ progress }: { progress: YearProgressData }) {
  const filledCount = Math.round(progress.fraction * TOTAL_CELLS)

  return (
    <>
      <div
        className="grid flex-1 grid-cols-[repeat(20,1fr)] content-center gap-0.75"
        aria-hidden="true"
      >
        {Array.from({ length: TOTAL_CELLS }, (_, index) => (
          <span
            key={index}
            className={`aspect-square rounded-[1.5px] ${
              index === filledCount - 1
                ? 'bg-zinc-50 ring-1 ring-(--theme-accent) ring-offset-1 ring-offset-zinc-900'
                : index < filledCount
                  ? 'bg-(--theme-accent)'
                  : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>
      <ProgressFooter progress={progress} />
    </>
  )
}

function OrbitDesign({ progress }: { progress: YearProgressData }) {
  const daysRemaining = progress.daysInYear - progress.dayOfYear

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="flex flex-1 items-center justify-center gap-5 py-1">
        <div className="relative size-30 shrink-0" aria-hidden="true">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="50"
              pathLength="100"
              fill="none"
              strokeWidth="8"
              className="stroke-zinc-800"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              pathLength="100"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progress.fraction * 100} 100`}
              className="stroke-(--theme-accent)"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-2xl font-bold text-(--theme-accent)">
            {progress.percent}%
          </span>
        </div>

        <div className="min-w-0">
          <p className="font-mono text-3xl font-semibold leading-none text-zinc-200">
            {progress.dayOfYear}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
            days elapsed
          </p>
          <div className="my-3 h-px bg-zinc-800" />
          <p className="text-sm font-medium text-zinc-400">
            {daysRemaining} remaining
          </p>
        </div>
      </div>
      <p className="text-right text-xs text-zinc-600">
        Day {progress.dayOfYear} of {progress.daysInYear}
      </p>
    </div>
  )
}

function MonthsDesign({ progress }: { progress: YearProgressData }) {
  const currentMonthFraction = progress.dayOfMonth / progress.daysInMonth

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="grid flex-1 grid-cols-4 content-center gap-2 py-1" aria-hidden="true">
        {MONTHS.map((month, index) => {
          const isPast = index < progress.monthIndex
          const isCurrent = index === progress.monthIndex

          return (
            <span
              key={month}
              className={`relative flex h-9 items-center justify-center overflow-hidden rounded-md border font-mono text-[10px] font-semibold uppercase tracking-wider ${
                isPast
                  ? 'border-(--theme-accent) bg-(--theme-accent) text-zinc-950'
                  : isCurrent
                    ? 'border-(--theme-accent) bg-zinc-800 text-(--theme-accent)'
                    : 'border-zinc-800 bg-zinc-800/60 text-zinc-600'
              }`}
            >
              {month}
              {isCurrent && (
                <span className="absolute inset-x-1 bottom-1 h-0.5 overflow-hidden rounded-full bg-zinc-700">
                  <span
                    className="block h-full rounded-full bg-(--theme-accent)"
                    style={{ width: `${currentMonthFraction * 100}%` }}
                  />
                </span>
              )}
            </span>
          )
        })}
      </div>
      <ProgressFooter progress={progress} />
    </div>
  )
}

function QuartersDesign({ progress }: { progress: YearProgressData }) {
  const { quarterIndex, fraction: currentQuarterProgress } =
    getQuarterProgress(progress)

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="grid flex-1 grid-cols-2 content-center gap-2 py-1" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => {
          const isPast = index < quarterIndex
          const isCurrent = index === quarterIndex
          const fill = isPast ? 1 : isCurrent ? currentQuarterProgress : 0

          return (
            <div
              key={index}
              className="relative flex h-16 items-center justify-between overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800/60 px-3"
            >
              <span
                className="absolute inset-y-0 left-0 bg-(--theme-accent) opacity-30"
                style={{ width: `${fill * 100}%` }}
              />
              <span className="relative font-mono text-xs font-semibold text-zinc-300">
                Q{index + 1}
              </span>
              <span className="relative font-mono text-[10px] text-zinc-500">
                {Math.round(fill * 100)}%
              </span>
            </div>
          )
        })}
      </div>
      <ProgressFooter progress={progress} />
    </div>
  )
}

function ColumnsDesign({ progress }: { progress: YearProgressData }) {
  const currentMonthFraction = progress.dayOfMonth / progress.daysInMonth

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="flex flex-1 items-center py-2">
        <div className="grid w-full grid-cols-12 items-end gap-1.5" aria-hidden="true">
          {MONTHS.map((month, index) => {
            const fill =
              index < progress.monthIndex
                ? 1
                : index === progress.monthIndex
                  ? currentMonthFraction
                  : 0

            return (
              <div key={month} className="flex flex-col items-center gap-2">
                <span className="relative h-24 w-full overflow-hidden rounded-sm bg-zinc-800">
                  <span
                    className="absolute inset-x-0 bottom-0 bg-(--theme-accent)"
                    style={{ height: `${fill * 100}%` }}
                  />
                </span>
                <span className="font-mono text-[8px] uppercase text-zinc-600">
                  {month.charAt(0)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <p className="text-right text-xs text-zinc-600">
        Day {progress.dayOfYear} of {progress.daysInYear}
      </p>
    </div>
  )
}

function CountdownDesign({ progress }: { progress: YearProgressData }) {
  const daysRemaining = progress.daysInYear - progress.dayOfYear

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="flex flex-1 flex-col justify-center">
        <p className="font-mono text-7xl font-semibold leading-none tracking-tighter text-zinc-100">
          {daysRemaining}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            days left
          </p>
          <p className="font-mono text-sm text-zinc-500">{progress.percent}% used</p>
        </div>
        <div className="mt-5 h-px bg-zinc-800" aria-hidden="true">
          <div
            className="h-px bg-(--theme-accent)"
            style={{ width: `${progress.fraction * 100}%` }}
          />
        </div>
      </div>
      <p className="text-right text-xs text-zinc-600">
        Day {progress.dayOfYear} of {progress.daysInYear}
      </p>
    </div>
  )
}

function StripesDesign({ progress }: { progress: YearProgressData }) {
  const currentMonthFraction = progress.dayOfMonth / progress.daysInMonth

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div
        className="grid flex-1 grid-cols-2 content-center gap-x-4 gap-y-2 py-1"
        aria-hidden="true"
      >
        {MONTHS.map((month, index) => {
          const fill =
            index < progress.monthIndex
              ? 1
              : index === progress.monthIndex
                ? currentMonthFraction
                : 0

          return (
            <div key={month} className="grid grid-cols-[1.5rem_1fr] items-center gap-1.5">
              <span className="font-mono text-[8px] leading-none uppercase text-zinc-600">
                {month}
              </span>
              <span className="h-1 overflow-hidden bg-zinc-800">
                <span
                  className="block h-full bg-(--theme-accent)"
                  style={{ width: `${fill * 100}%` }}
                />
              </span>
            </div>
          )
        })}
      </div>
      <ProgressFooter progress={progress} />
    </div>
  )
}

function GaugeDesign({ progress }: { progress: YearProgressData }) {
  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="flex flex-1 flex-col items-center justify-center py-2">
        <div className="relative h-28 w-48" aria-hidden="true">
          <svg viewBox="0 0 160 90" className="size-full">
            <path
              d="M 10 80 A 70 70 0 0 1 150 80"
              pathLength="100"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className="stroke-zinc-800"
            />
            <path
              d="M 10 80 A 70 70 0 0 1 150 80"
              pathLength="100"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${progress.fraction * 100} 100`}
              className="stroke-(--theme-accent)"
            />
          </svg>
          <span className="absolute inset-x-0 bottom-0 text-center font-mono text-3xl font-semibold text-(--theme-accent)">
            {progress.percent}%
          </span>
        </div>
        <div className="mt-2 flex w-48 justify-between font-mono text-[9px] text-zinc-600">
          <span>0</span>
          <span>{progress.daysInYear}</span>
        </div>
      </div>
      <p className="text-right text-xs text-zinc-600">
        Day {progress.dayOfYear} of {progress.daysInYear}
      </p>
    </div>
  )
}

function FractionDesign({ progress }: { progress: YearProgressData }) {
  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="grid flex-1 place-items-center py-2">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 font-mono">
          <span className="text-right text-5xl font-semibold tracking-tighter text-(--theme-accent)">
            {progress.dayOfYear}
          </span>
          <span className="h-20 w-px rotate-12 bg-zinc-700" aria-hidden="true" />
          <span className="text-5xl font-semibold tracking-tighter text-zinc-500">
            {progress.daysInYear}
          </span>
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-widest text-zinc-600">days</p>
        <p className="text-2xl font-bold text-(--theme-accent)">{progress.percent}%</p>
      </div>
    </div>
  )
}

function RingsDesign({ progress }: { progress: YearProgressData }) {
  const { fraction: quarterFraction } = getQuarterProgress(progress)
  const monthFraction = progress.dayOfMonth / progress.daysInMonth
  const rings = [
    {
      label: 'Year',
      radius: 52,
      width: 7,
      fraction: progress.fraction,
      strokeClass: 'stroke-(--theme-accent)',
      dotClass: 'bg-(--theme-accent)',
      textClass: 'text-(--theme-accent)',
    },
    {
      label: 'Quarter',
      radius: 39,
      width: 7,
      fraction: quarterFraction,
      strokeClass: 'stroke-(--theme-accent) opacity-70',
      dotClass: 'bg-(--theme-accent) opacity-70',
      textClass: 'text-(--theme-accent) opacity-70',
    },
    {
      label: 'Month',
      radius: 26,
      width: 7,
      fraction: monthFraction,
      strokeClass: 'stroke-(--theme-accent) opacity-40',
      dotClass: 'bg-(--theme-accent) opacity-40',
      textClass: 'text-(--theme-accent) opacity-40',
    },
  ]

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="flex flex-1 items-center justify-center gap-5 py-1">
        <div className="relative size-32 shrink-0" aria-hidden="true">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            {rings.map((ring) => (
              <g key={ring.radius}>
                <circle
                  cx="60"
                  cy="60"
                  r={ring.radius}
                  pathLength="100"
                  fill="none"
                  strokeWidth={ring.width}
                  className="stroke-zinc-800"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={ring.radius}
                  pathLength="100"
                  fill="none"
                  strokeWidth={ring.width}
                  strokeLinecap="round"
                  strokeDasharray={`${ring.fraction * 100} 100`}
                  className={ring.strokeClass}
                />
              </g>
            ))}
          </svg>
          <span className="absolute inset-0 grid place-items-center font-mono text-sm font-semibold text-(--theme-accent)">
            {progress.percent}%
          </span>
        </div>
        <div className="w-25 space-y-2.5 text-xs">
          {rings.map((ring) => (
            <p
              key={ring.label}
              className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 ${ring.textClass}`}
            >
              <span className={`size-1.5 rounded-full ${ring.dotClass}`} />
              <span>{ring.label}</span>
              <span className="font-mono text-[10px]">
                {Math.round(ring.fraction * 100)}%
              </span>
            </p>
          ))}
        </div>
      </div>
      <p className="text-right text-xs text-zinc-600">
        Day {progress.dayOfYear} of {progress.daysInYear}
      </p>
    </div>
  )
}

function CalendarDesign({ progress }: { progress: YearProgressData }) {
  const startOfYear = Date.UTC(progress.year, 0, 1)

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="flex flex-1 flex-col justify-center gap-1 py-1" aria-hidden="true">
        {MONTHS.map((month, monthIndex) => {
          const daysInMonth = new Date(
            Date.UTC(progress.year, monthIndex + 1, 0),
          ).getUTCDate()
          const monthStartDay =
            (Date.UTC(progress.year, monthIndex, 1) - startOfYear) / DAY_IN_MS

          return (
            <div
              key={month}
              className="grid grid-cols-[1.25rem_repeat(31,minmax(0,1fr))] items-center gap-0.75"
            >
              <span className="font-mono text-[8px] uppercase text-zinc-600">
                {month.charAt(0)}
              </span>
              {Array.from({ length: 31 }, (_, dayIndex) => {
                const isValid = dayIndex < daysInMonth
                const ordinal = monthStartDay + dayIndex + 1
                const isPast = ordinal <= progress.dayOfYear
                const isToday = ordinal === progress.dayOfYear

                return (
                  <span
                    key={dayIndex}
                    className={`aspect-square rounded-full ${
                      !isValid
                        ? 'opacity-0'
                        : isToday
                          ? 'bg-zinc-50 ring-1 ring-(--theme-accent) ring-offset-1 ring-offset-zinc-900'
                          : isPast
                            ? 'bg-(--theme-accent)'
                            : 'bg-zinc-800'
                    }`}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
      <ProgressFooter progress={progress} />
    </div>
  )
}

export default function YearProgressDesign({
  index,
  progress,
}: {
  index: number
  progress: YearProgressData
}) {
  switch (index) {
    case 1:
      return <OrbitDesign progress={progress} />
    case 2:
      return <MonthsDesign progress={progress} />
    case 3:
      return <QuartersDesign progress={progress} />
    case 4:
      return <ColumnsDesign progress={progress} />
    case 5:
      return <CountdownDesign progress={progress} />
    case 6:
      return <StripesDesign progress={progress} />
    case 7:
      return <GaugeDesign progress={progress} />
    case 8:
      return <FractionDesign progress={progress} />
    case 9:
      return <RingsDesign progress={progress} />
    case 10:
      return <CalendarDesign progress={progress} />
    default:
      return <MatrixDesign progress={progress} />
  }
}
