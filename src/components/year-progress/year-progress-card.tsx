import YearProgressCardPreview from '@/components/year-progress/year-progress-card-preview';
import type { YearProgressData } from '@/components/year-progress/year-progress-designs';

const DAY_IN_MS = 86_400_000;

function getYearProgress(now = new Date()): YearProgressData {
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const dayOfMonth = now.getDate();
  const start = Date.UTC(year, 0, 1);
  const today = Date.UTC(year, monthIndex, dayOfMonth);
  const end = Date.UTC(year + 1, 0, 1);
  const daysInYear = Math.round((end - start) / DAY_IN_MS);
  const dayOfYear = Math.floor((today - start) / DAY_IN_MS) + 1;
  const fraction = dayOfYear / daysInYear;

  return {
    year,
    daysInYear,
    dayOfYear,
    fraction,
    percent: Math.round(fraction * 100),
    monthIndex,
    dayOfMonth,
    daysInMonth: new Date(year, monthIndex + 1, 0).getDate(),
  };
}

export default function YearProgressCard() {
  return <YearProgressCardPreview progress={getYearProgress()} />;
}
