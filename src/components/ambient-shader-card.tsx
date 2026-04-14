'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useSyncExternalStore } from 'react'
import type { MeshGradientProps } from '@paper-design/shaders-react'

const FALLBACK_COLORS = ['#09090b', '#18181b', '#7f1d1d', '#dc2626']
const COLOR_FORMAT = /^(#|rgb|hsl)/

const MeshGradient = dynamic<MeshGradientProps>(
  () => import('@paper-design/shaders-react').then((mod) => mod.MeshGradient),
  { ssr: false },
)

function readThemeColors() {
  const style = getComputedStyle(document.documentElement)
  const primary = style.getPropertyValue('--theme-primary').trim()
  const accent = style.getPropertyValue('--theme-accent').trim()
  const themeColors = [primary, accent].filter((color) => COLOR_FORMAT.test(color))

  return themeColors.length > 0
    ? ['#09090b', '#18181b', ...themeColors]
    : FALLBACK_COLORS
}

function createMediaQueryStore(query: string) {
  const getSnapshot = () => window.matchMedia(query).matches
  const getServerSnapshot = () => false
  const subscribe = (callback: () => void) => {
    const mediaQuery = window.matchMedia(query)
    mediaQuery.addEventListener('change', callback)

    return () => mediaQuery.removeEventListener('change', callback)
  }

  return { getSnapshot, getServerSnapshot, subscribe }
}

const reducedMotionStore = createMediaQueryStore('(prefers-reduced-motion: reduce)')
const desktopViewportStore = createMediaQueryStore('(min-width: 1024px)')

function useMediaQuery(store: ReturnType<typeof createMediaQueryStore>) {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  )
}

function useShaderColors() {
  const [colors, setColors] = useState(FALLBACK_COLORS)

  useEffect(() => {
    const updateColors = () => setColors(readThemeColors())
    updateColors()

    const observer = new MutationObserver(updateColors)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    })

    return () => observer.disconnect()
  }, [])

  return colors
}

export default function AmbientShaderCard() {
  const prefersReducedMotion = useMediaQuery(reducedMotionStore)
  const isDesktop = useMediaQuery(desktopViewportStore)
  const colors = useShaderColors()

  return (
    <div
      className="relative h-full min-h-44 overflow-hidden rounded-3xl border border-zinc-800/50 bg-zinc-950 shine-edge"
      aria-hidden={true}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.22),transparent_42%),radial-gradient(circle_at_80%_70%,rgba(113,113,122,0.24),transparent_34%)]" />
      {isDesktop && (
        <MeshGradient
          className="absolute inset-0 h-full w-full opacity-80"
          width="100%"
          height="100%"
          colors={colors}
          distortion={0.72}
          swirl={0.18}
          grainMixer={0.08}
          grainOverlay={0.12}
          speed={prefersReducedMotion ? 0 : 0.4}
          frame={4200}
          fit="cover"
          scale={1.2}
          rotation={18}
          minPixelRatio={1}
          maxPixelCount={280000}
        />
      )}
      <div className="absolute inset-0 bg-linear-to-b from-zinc-950/10 via-transparent to-zinc-950/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(9,9,11,0.36)_72%)]" />
    </div>
  )
}
