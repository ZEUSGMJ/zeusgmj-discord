import type { SyntheticEvent } from 'react';

export function hideOnError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.display = 'none';
}
