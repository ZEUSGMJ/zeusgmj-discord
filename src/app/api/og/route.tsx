import { ImageResponse } from 'next/og'
import { fetchDiscordProfile } from '@/lib/discord-profile'
import { intToHex } from '@/lib/discord-profile.shared'
import { fetchLanyard } from '@/lib/lanyard'
import { normalizeLanyard } from '@/lib/lanyard.shared'
import type { NormalizedPresence } from '@/lib/lanyard.shared'
import { grainBase64 } from '@/lib/grain-base64'

export const runtime = 'nodejs'

const FALLBACK_COLOR = 'hsla(244,100%,50%,1)'
const DARK_STOP = 'hsla(319,0%,0%,1)'

function toPng(url: string): string {
  return url.replace(/\.webp(\?|$)/, '.png$1').replace(/[&?]animated=true/, '')
}

const STATUS_COLOR: Record<NormalizedPresence['status'], string> = {
  online: '#23a559',
  idle: '#f0b232',
  dnd: '#f23f42',
  offline: '#80848e',
}

export async function GET() {
  const userId = process.env.DISCORD_USER_ID
  let gradientColor = FALLBACK_COLOR
  let bannerHash: string | null = null
  let presence: NormalizedPresence | null = null

  if (userId) {
    const [profileResult, lanyardResult] = await Promise.allSettled([
      fetchDiscordProfile(userId),
      fetchLanyard(userId),
    ])

    if (profileResult.status === 'fulfilled') {
      const profile = profileResult.value
      if (profile.themeColors) gradientColor = intToHex(profile.themeColors[0])
      bannerHash = profile.bannerHash
    }

    if (lanyardResult.status === 'fulfilled') {
      presence = normalizeLanyard(lanyardResult.value)
    }
  }

  const avatarUrl = presence?.user.avatarUrl ? toPng(presence.user.avatarUrl) : null
  const rawBannerUrl =
    presence?.user.bannerUrl ??
    (bannerHash && userId
      ? `https://cdn.discordapp.com/banners/${userId}/${bannerHash}.webp?size=2048`
      : null)
  const bannerUrl = rawBannerUrl ? toPng(rawBannerUrl) : null
  const status = presence?.status ?? null
  const dotColor = status ? STATUS_COLOR[status] : '#a78bfa'

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          position: 'relative',
          display: 'flex',
          overflow: 'hidden',
          backgroundColor: gradientColor,
          backgroundImage: `radial-gradient(circle at 50% 0%, ${DARK_STOP} 49%, transparent 100%)`,
        }}
      >
        {bannerUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerUrl}
              alt=""
              width={1200}
              height={320}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 1200,
                height: 256,
                objectFit: 'cover',
                objectPosition: 'top',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 320,
                background: 'linear-gradient(to bottom, transparent 50%, black)',
              }}
            />
          </>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 630,
            background: 'linear-gradient(to bottom, transparent 50%, black 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            flexWrap: 'wrap',
            opacity: 0.05,
            width: 1280,
            height: 768,
          }}
        >
          {Array.from({ length: 15 }).map((_, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={grainBase64} width={256} height={256} alt="" style={{ flexShrink: 0 }} />
          ))}
        </div>
        {avatarUrl && (
          <div
            style={{
              position: 'absolute',
              top: 156,
              left: 60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              border: '4px solid rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt=""
              width={192}
              height={192}
              style={{ borderRadius: '50%' }}
            />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            left: 64,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                background: dotColor,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.15em',
                fontFamily: 'sans-serif',
              }}
            >
              zeusgmj.com
            </span>
          </div>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.02em',
              fontFamily: 'sans-serif',
              lineHeight: 1,
            }}
          >
            zeusgmj
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
