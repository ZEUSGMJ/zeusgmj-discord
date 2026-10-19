export function formatHours(minutes: number): string {
  const hours = minutes / 60;
  if (hours === 0) return '0 h';
  return hours < 10 ? `${hours.toFixed(1)} h` : `${Math.round(hours)} h`;
}
