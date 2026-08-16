import type { CSSProperties } from 'react'
import {
  BLACK,
  HEX_COLOR,
  WHITE,
  capLuminance,
  hexToLuminance,
  minContrastAgainst,
  pickForeground,
  type ForegroundDirection,
} from '@/lib/contrast.shared'

const FALLBACK_BACKGROUND_COLORS = ['#1e1b4b', '#09090b'] as const

function getBackgroundColors(
  themeColor1: string | null,
  themeColor2: string | null,
  bannerColor: string | null,
): [string, string] {
  if (themeColor1 && themeColor2) return [capLuminance(themeColor1), capLuminance(themeColor2)]
  if (bannerColor && HEX_COLOR.test(bannerColor)) return [capLuminance(bannerColor), '#09090b']
  return [...FALLBACK_BACKGROUND_COLORS]
}

export function buildPresenceTheme(
  themeColor1: string | null,
  themeColor2: string | null,
  bannerColor: string | null,
): CSSProperties {
  const backgroundColors = getBackgroundColors(themeColor1, themeColor2, bannerColor)
  const backgroundLs = backgroundColors.map(hexToLuminance)
  const textDir: ForegroundDirection =
    minContrastAgainst(WHITE, backgroundLs) >= minContrastAgainst(BLACK, backgroundLs)
      ? 'light'
      : 'dark'

  const cftHi = pickForeground(backgroundLs, 4.5, textDir, 'strong')
  const cftMid = pickForeground(backgroundLs, 7.0, textDir, 'subtle')
  const cftDim = pickForeground(backgroundLs, 4.5, textDir, 'subtle')

  const cftSurf = textDir === 'light'
    ? {
        badgeBg: 'rgba(39,39,42,0.8)',
        statusBg: '#09090b',
        separator: 'rgba(39,39,42,0.6)',
        progTrack: 'rgba(39,39,42,0.8)',
        imgFallBg: 'rgba(39,39,42,1)',
      }
    : {
        badgeBg: 'rgba(255,255,255,0.6)',
        statusBg: 'rgba(255,255,255,0.5)',
        separator: 'rgba(212,212,216,0.6)',
        progTrack: 'rgba(212,212,216,0.8)',
        imgFallBg: 'rgba(255,255,255,0.4)',
      }

  return {
    background: `linear-gradient(to bottom, ${backgroundColors[0]}, ${backgroundColors[1]})`,
    '--cft-hi': cftHi,
    '--cft-mid': cftMid,
    '--cft-lo': cftMid,
    '--cft-dim': cftDim,
    '--cft-badge-bg': cftSurf.badgeBg,
    '--cft-status-bg': cftSurf.statusBg,
    '--cft-sep': cftSurf.separator,
    '--cft-prog-trk': cftSurf.progTrack,
    '--cft-img-fb': cftSurf.imgFallBg,
    '--cft-dot-hover': cftMid,
  } as CSSProperties
}
