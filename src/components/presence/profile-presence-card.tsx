'use client';

import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from 'motion/react';
import { useEffect, useRef } from 'react';
import { buildPresenceTheme } from '@/lib/presence-theme.shared';
import { usePresence } from '@/components/presence/presence-provider';
import { useReveal } from '@/components/reveal/reveal-context';
import RevealToggle from '@/components/reveal/reveal-toggle';
import {
  DUR_CARD_EXIT,
  DUR_ITEM,
  EASE_IN,
  EASE_OUT,
  LAYOUT_TRANSITION,
  PROFILE_COMPACT_TRANSITION,
  PROFILE_SETTLE_TRANSITION,
} from '@/components/reveal/timing';
import PresenceHeader from '@/components/presence/presence-header';
import PresenceIdentity from '@/components/presence/presence-identity';
import PresenceNameplate from '@/components/presence/presence-nameplate';
import ActivityCarousel from '@/components/presence/activity-carousel';
import {
  normalizeSpotify,
  type CarouselItem,
} from '@/components/presence/activity-row';

const TAGLINE = 'building things on the internet';

export default function ProfilePresenceCard() {
  const {
    state,
    userId: discordUserId,
    discordProfile,
    themeColor1,
    themeColor2,
  } = usePresence();
  const {
    targetExpanded,
    layoutExpanded,
    intentGeneration,
    nameplateVisible,
    profileSettle,
    registerNameplate,
    onProfileLayoutAnimationComplete,
  } = useReveal();
  const compact = !layoutExpanded;
  const reduceMotion = useReducedMotion() ?? false;
  const settleControls = useAnimationControls();
  const lastSettleRevisionRef = useRef(0);

  useEffect(() => {
    settleControls.stop();
    settleControls.set({ scale: 1 });
  }, [reduceMotion, settleControls, targetExpanded]);

  useEffect(() => {
    if (
      !profileSettle ||
      profileSettle.revision === lastSettleRevisionRef.current
    )
      return;
    if (profileSettle.generation !== intentGeneration) return;
    lastSettleRevisionRef.current = profileSettle.revision;
    if (reduceMotion) return;

    settleControls.stop();
    settleControls.set({
      scale: profileSettle.direction === 'expanded' ? 1.012 : 0.992,
    });
    void settleControls.start({
      scale: 1,
      transition: PROFILE_SETTLE_TRANSITION,
    });
  }, [intentGeneration, profileSettle, reduceMotion, settleControls]);

  useEffect(() => () => settleControls.stop(), [settleControls]);

  useEffect(() => {
    registerNameplate(Boolean(discordProfile?.collectibles?.nameplate));
  }, [discordProfile?.collectibles?.nameplate, registerNameplate]);

  if (state.phase === 'loading') {
    return (
      <motion.div
        layout
        animate={{ borderRadius: compact ? 12 : 24 }}
        transition={compact ? PROFILE_COMPACT_TRANSITION : LAYOUT_TRANSITION}
        onLayoutAnimationComplete={onProfileLayoutAnimationComplete}
        className={
          compact ? 'relative aspect-16/3 max-h-21 min-h-16' : 'relative h-full'
        }
      >
        <motion.div
          initial={false}
          animate={settleControls}
          className={
            compact
              ? 'relative flex h-full w-full origin-center animate-pulse items-center gap-3 overflow-hidden rounded-[inherit] bg-zinc-900 px-4 py-2.5'
              : 'relative flex h-full w-full origin-center animate-pulse flex-col overflow-hidden rounded-[inherit] bg-zinc-900'
          }
        >
          {compact ? (
            <>
              <div className="size-12 shrink-0 rounded-full bg-zinc-700" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3 w-24 rounded bg-zinc-800" />
                <div className="h-2.5 w-32 rounded bg-zinc-800" />
              </div>
              <RevealToggle compact />
            </>
          ) : (
            <>
              <div className="h-20 bg-zinc-800" />
              <div className="px-6 pb-6">
                <div className="-mt-8 mb-4 flex items-end gap-3">
                  <div className="h-16 w-16 shrink-0 rounded-full bg-zinc-700 ring-4 ring-zinc-900" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-36 rounded bg-zinc-800" />
                  <div className="h-3 w-24 rounded bg-zinc-800" />
                </div>
              </div>
            </>
          )}
          {!compact && <RevealToggle compact={false} />}
        </motion.div>
      </motion.div>
    );
  }

  if (state.phase === 'error') {
    return (
      <div className="flex h-full min-h-52 items-center justify-center rounded-3xl bg-zinc-900 p-6">
        <p className="text-sm text-zinc-600">Could not load presence data</p>
      </div>
    );
  }

  const { presence, currentTrack, isRecentlyPlayed } = state;
  const spotifySource = presence.spotify ?? currentTrack;
  const fromApi = !presence.listeningToSpotify && currentTrack !== null;
  const spotify = spotifySource ? normalizeSpotify(spotifySource) : null;

  const dcdnBannerHash = discordProfile?.bannerHash ?? null;
  const bannerUrl =
    presence.user.bannerUrl ??
    (dcdnBannerHash
      ? `https://cdn.discordapp.com/banners/${presence.user.id}/${dcdnBannerHash}.webp?size=2048${dcdnBannerHash.startsWith('a_') ? '&animated=true' : ''}`
      : null);

  const theme = buildPresenceTheme(
    themeColor1,
    themeColor2,
    presence.user.bannerColor,
  );

  const bio = discordProfile?.bio ?? TAGLINE;

  const carouselItems: CarouselItem[] = [
    ...presence.activities.map((a): CarouselItem => ({
      kind: 'activity',
      data: a,
    })),
    ...(spotify
      ? [{ kind: 'spotify' as const, data: spotify, fromApi, isRecentlyPlayed }]
      : []),
  ];

  return (
    <motion.div
      layout
      animate={{ borderRadius: compact ? 12 : 24 }}
      transition={compact ? PROFILE_COMPACT_TRANSITION : LAYOUT_TRANSITION}
      onLayoutAnimationComplete={onProfileLayoutAnimationComplete}
      className={
        compact ? 'relative aspect-16/3 max-h-21 min-h-16' : 'relative h-full'
      }
    >
      <motion.div
        initial={false}
        animate={settleControls}
        style={theme}
        className={
          compact
            ? 'relative flex h-full w-full origin-center items-center gap-3 overflow-hidden rounded-[inherit]'
            : 'relative flex h-full w-full origin-center flex-col overflow-hidden rounded-[inherit]'
        }
      >
        <PresenceNameplate
          nameplate={discordProfile?.collectibles?.nameplate ?? null}
          visible={compact && nameplateVisible}
        />

        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          aria-hidden={true}
        />

        <AnimatePresence mode="popLayout">
          {!compact &&
            (bannerUrl ? (
              <motion.div
                key="banner"
                layout
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: DUR_ITEM, ease: EASE_OUT },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: DUR_CARD_EXIT, ease: EASE_IN },
                }}
                className="relative min-h-52 w-full overflow-hidden bg-black/10"
              >
                <Image
                  src={bannerUrl}
                  alt="Discord banner"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover object-center"
                  preload
                  unoptimized={bannerUrl.includes('animated=true')}
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/40" />
              </motion.div>
            ) : (
              <div key="banner-spacer" className="min-h-52 w-full" />
            ))}
        </AnimatePresence>

        <motion.div
          layout
          transition={LAYOUT_TRANSITION}
          className={
            compact
              ? 'relative z-20 flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5'
              : 'relative z-20 flex flex-1 flex-col gap-4 px-6 pb-6'
          }
        >
          <PresenceHeader
            user={presence.user}
            status={presence.status}
            compact={compact}
          />

          <PresenceIdentity
            user={presence.user}
            primaryGuild={presence.primaryGuild}
            customStatus={presence.customStatus}
            badges={discordProfile?.badges ?? []}
            bio={bio}
            discordUserId={discordUserId}
            accentColor={themeColor2}
            compact={compact}
            listeningToSpotify={presence.listeningToSpotify}
          />

          {compact && <RevealToggle compact />}

          <AnimatePresence mode="popLayout">
            {!compact && (
              <motion.div
                key="carousel-section"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: DUR_ITEM, ease: EASE_OUT },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: DUR_CARD_EXIT, ease: EASE_IN },
                }}
              >
                <div className="border-t border-(--cft-sep)" />
                <div className="flex flex-1 flex-col justify-center pt-4">
                  {carouselItems.length === 0 ? (
                    <p className="text-sm text-(--cft-dim) italic">
                      No active activity
                    </p>
                  ) : (
                    <ActivityCarousel items={carouselItems} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!compact && <RevealToggle compact={false} />}
      </motion.div>
    </motion.div>
  );
}
