'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
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

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(query.matches)

    const onChange = () => setPrefersReducedMotion(query.matches)
    query.addEventListener('change', onChange)

    return () => query.removeEventListener('change', onChange)
  }, [])

  return prefersReducedMotion
}

function useDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(query.matches)

    const onChange = () => setIsDesktop(query.matches)
    query.addEventListener('change', onChange)

    return () => query.removeEventListener('change', onChange)
  }, [])

  return isDesktop
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
  const prefersReducedMotion = useReducedMotion()
  const isDesktop = useDesktopViewport()
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
          speed={prefersReducedMotion ? 0 : 0.08}
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
