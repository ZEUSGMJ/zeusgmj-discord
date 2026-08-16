export type ContrastCandidate = { hex: string; L: number }
export type ForegroundDirection = 'light' | 'dark'

export const ZINC: ContrastCandidate[] = [
  { hex: '#fafafa', L: 0.955 },
  { hex: '#f4f4f5', L: 0.910 },
  { hex: '#e4e4e7', L: 0.796 },
  { hex: '#d4d4d8', L: 0.684 },
  { hex: '#a1a1aa', L: 0.373 },
  { hex: '#71717a', L: 0.193 },
  { hex: '#52525b', L: 0.107 },
  { hex: '#3f3f46', L: 0.066 },
  { hex: '#27272a', L: 0.031 },
  { hex: '#18181b', L: 0.014 },
  { hex: '#09090b', L: 0.003 },
]

export const WHITE: ContrastCandidate = { hex: '#ffffff', L: 1 }
export const BLACK: ContrastCandidate = { hex: '#000000', L: 0 }
export const HEX_COLOR = /^#[\da-f]{6}$/i
export const MAX_BACKGROUND_LUMINANCE = 0.06

const srgbToLinear = (c: number) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
const linearToSrgb = (c: number) => c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055

export function hexToLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

export function capLuminance(hex: string): string {
  if (!HEX_COLOR.test(hex)) return hex
  const L = hexToLuminance(hex)
  if (L <= MAX_BACKGROUND_LUMINANCE) return hex
  const k = MAX_BACKGROUND_LUMINANCE / L
  const channel = (i: number) => {
    const scaled = linearToSrgb(srgbToLinear(parseInt(hex.slice(i, i + 2), 16) / 255) * k)
    return Math.round(Math.min(1, Math.max(0, scaled)) * 255).toString(16).padStart(2, '0')
  }
  return `#${channel(1)}${channel(3)}${channel(5)}`
}

export function wcagContrast(La: number, Lb: number): number {
  const [hi, lo] = La > Lb ? [La, Lb] : [Lb, La]
  return (hi + 0.05) / (lo + 0.05)
}

export function contrastRatio(hexA: string, hexB: string): number {
  return wcagContrast(hexToLuminance(hexA), hexToLuminance(hexB))
}

export function minContrastAgainst(candidate: ContrastCandidate, backgroundLs: number[]): number {
  return Math.min(...backgroundLs.map((bgL) => wcagContrast(candidate.L, bgL)))
}

function bestForeground(backgroundLs: number[]): ContrastCandidate {
  return [WHITE, BLACK, ...ZINC].reduce((best, candidate) =>
    minContrastAgainst(candidate, backgroundLs) > minContrastAgainst(best, backgroundLs)
      ? candidate
      : best
  )
}

export function pickForeground(
  backgroundLs: number[],
  minRatio: number,
  direction: ForegroundDirection,
  strength: 'strong' | 'subtle',
): string {
  const ordered = direction === 'light' ? ZINC : [...ZINC].reverse()
  const passing = ordered.filter((candidate) => minContrastAgainst(candidate, backgroundLs) >= minRatio)

  if (passing.length > 0) {
    return strength === 'strong' ? passing[0].hex : passing[passing.length - 1].hex
  }

  const fallback = direction === 'light' ? WHITE : BLACK
  if (minContrastAgainst(fallback, backgroundLs) >= minRatio) {
    return fallback.hex
  }

  return bestForeground(backgroundLs).hex
}
