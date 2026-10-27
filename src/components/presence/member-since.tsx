'use client';

import { useState } from 'react';
import { snowflakeToDate } from '@/lib/discord-profile.shared';

const STYLES = ['D', 'd', 'F', 'R'] as const;
type TimestampStyle = (typeof STYLES)[number];

const RELATIVE = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

function formatRelative(date: Date) {
  const seconds = (date.getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return RELATIVE.format(Math.trunc(seconds / size), unit);
    }
  }
  return RELATIVE.format(Math.trunc(seconds), 'second');
}

export function formatTimestamp(date: Date, style: TimestampStyle): string {
  switch (style) {
    case 'D':
      return date.toLocaleDateString(undefined, { dateStyle: 'long' });
    case 'd':
      return date.toLocaleDateString(undefined, { dateStyle: 'short' });
    case 'F':
      return date.toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'short',
      });
    case 'R':
      return formatRelative(date);
  }
}

export default function MemberSince({ userId }: { userId: string }) {
  const [styleIndex, setStyleIndex] = useState(0);
  const date = snowflakeToDate(userId);

  if (!date) return null;

  const formatted = formatTimestamp(date, STYLES[styleIndex]);

  return (
    <button
      type="button"
      onClick={() => setStyleIndex((i) => (i + 1) % STYLES.length)}
      title={formatTimestamp(date, 'F')}
      aria-label={`Member since ${formatted}, change date format`}
      className="group cursor-pointer rounded-sm text-left transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-(--cft-dim) focus-visible:outline-none active:scale-[0.97]"
    >
      <span className="decoration-(--cft-dim) decoration-dotted underline-offset-4 group-hover:underline">
        Member since {formatted}
      </span>
    </button>
  );
}
