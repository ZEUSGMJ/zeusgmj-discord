import { ImageResponse } from 'next/og'
import { fetchDiscordProfile } from '@/lib/discord-profile'
import { intToHex } from '@/lib/discord-profile.shared'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'
export const revalidate = 3600

function linearize(c: number): number {
  const sRGB = c / 255
  return sRGB <= 0.04045 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function pickBackground(textHex: string, preferredBgHex: string): string {
  if (contrastRatio(textHex, preferredBgHex) >= 3.5) return preferredBgHex
  return contrastRatio(textHex, '#000000') >= contrastRatio(textHex, '#ffffff')
    ? '#000000'
    : '#ffffff'
}

async function loadRobotoSerifFont(): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Roboto+Serif:ital,wght@1,800&display=swap'
    )
    if (!cssRes.ok) return null
    const css = await cssRes.text()
    const match = css.match(/src:\s*url\(([^)]+)\)/)
    if (!match) return null
    const fontRes = await fetch(match[1])
    if (!fontRes.ok) return null
    return fontRes.arrayBuffer()
  } catch {
    return null
  }
}

export default async function Icon() {
  const userId = process.env.DISCORD_USER_ID
  let textColor = '#ffffff'
  let bgColor = '#000000'

  if (userId) {
    try {
      const profile = await fetchDiscordProfile(userId)
      if (profile.themeColors) {
        const fgHex = intToHex(profile.themeColors[0])
        const candidateBgHex = intToHex(profile.themeColors[1])
        textColor = fgHex
        bgColor = pickBackground(fgHex, candidateBgHex)
      }
    } catch {}
  }

  const fontData = await loadRobotoSerifFont()

  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: fontData ? '"Roboto Serif"' : 'serif',
            fontWeight: 800,
            fontStyle: 'italic',
            fontSize: 42,
            color: textColor,
            lineHeight: 1,
            marginTop: 4,
          }}
        >
          Z
        </span>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Roboto Serif', data: fontData, weight: 800, style: 'italic' }]
        : [],
    }
  )
}
