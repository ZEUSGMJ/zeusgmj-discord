'use client';

import { useEffect } from 'react';

export default function LiquidGlassSupport() {
  useEffect(() => {
    const {
      deviceMemory = 8,
      hardwareConcurrency = 8,
      connection,
    } = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const supported =
      CSS.supports('backdrop-filter', 'url(#liquid-glass)') &&
      /Chrome\//.test(navigator.userAgent) &&
      matchMedia('(hover: hover) and (pointer: fine)').matches &&
      deviceMemory >= 4 &&
      hardwareConcurrency >= 4 &&
      !connection?.saveData;
    if (!supported) return;

    const root = document.documentElement;
    root.dataset.liquidGlass = '';
    return () => {
      delete root.dataset.liquidGlass;
    };
  }, []);

  return null;
}
