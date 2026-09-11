'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { DiscordProfileNameplate } from '@/lib/discord-profile.shared'
import {
  DUR_MICRO,
  DUR_NAMEPLATE_ENTER,
  EASE_IN_OUT,
  EASE_OUT,
} from '@/components/reveal/timing'

interface PresenceNameplateProps {
  nameplate: DiscordProfileNameplate | null
  visible: boolean
}

export default function PresenceNameplate({ nameplate, visible }: PresenceNameplateProps) {
  const reduceMotion = useReducedMotion() ?? false
  const videoRef = useRef<HTMLVideoElement>(null)
  const [documentVisible, setDocumentVisible] = useState(true)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    const updateVisibility = () => setDocumentVisible(!document.hidden)
    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoReady(false)
      setVideoFailed(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [nameplate?.animatedUrl])

  const videoVisible = Boolean(nameplate && visible && documentVisible && !reduceMotion && !videoFailed)

  useEffect(() => {
    const video = videoRef.current
    if (!videoVisible) {
      video?.pause()
      return
    }
    void video?.play().catch(() => {})
  }, [videoVisible])

  if (!nameplate) return null

  return (
    <motion.div
      aria-hidden={true}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{
        duration: reduceMotion || !visible ? DUR_MICRO : DUR_NAMEPLATE_ENTER,
        ease: reduceMotion || !visible ? EASE_OUT : EASE_IN_OUT,
      }}
    >
      <Image
        src={nameplate.staticUrl}
        alt=""
        fill
        preload
        sizes="(max-width: 640px) calc(100vw - 2rem), 512px"
        className="object-cover object-left"
      />
      {videoVisible && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden={true}
          className={`absolute inset-0 h-full w-full object-cover object-left transition-opacity duration-150 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
          onCanPlay={() => setVideoReady(true)}
          onError={() => {
            setVideoFailed(true)
            setVideoReady(false)
          }}
        >
          <source src={nameplate.animatedUrl} type="video/webm" />
        </video>
      )}
      <div className="absolute inset-0 z-10 bg-linear-to-r from-black/75 via-black/35 to-black/5" />
    </motion.div>
  )
}
