'use client';

import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from 'motion/react';
import { useEffect, useRef } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
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
const COMPACT_ACCENT_FALLBACK = '#71717b';

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
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const settleControls = useAnimationControls();
  const lastSettleRevisionRef = useRef(0);
  const cardRadius = compact ? (isDesktop ? 24 : 22) : isDesktop ? 32 : 28;

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
        animate={{ borderRadius: cardRadius }}
        transition={compact ? PROFILE_COMPACT_TRANSITION : LAYOUT_TRANSITION}
        onLayoutAnimationComplete={onProfileLayoutAnimationComplete}
        className={
          compact ? 'relative h-[76px] lg:h-20' : 'relative h-full min-h-96'
        }
      >
        <motion.div
          initial={false}
          animate={settleControls}
          className={
            compact
              ? 'relative flex h-full w-full origin-center animate-pulse items-center gap-3 overflow-hidden rounded-[inherit] bg-surface pr-3.5 pl-3 lg:gap-4 lg:pr-5 lg:pl-3.5'
              : 'relative flex h-full w-full origin-center animate-pulse flex-col overflow-hidden rounded-[inherit] bg-surface'
          }
        >
          {compact ? (
            <>
              <div className="size-12 shrink-0 rounded-full bg-surface-raised lg:size-13" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-28 rounded bg-surface-raised" />
                <div className="h-3 w-40 rounded bg-surface-raised" />
              </div>
              <RevealToggle compact />
            </>
          ) : (
            <>
              <div className="h-[132px] bg-surface-raised lg:h-56" />
              <div className="px-5 pb-5 lg:px-8 lg:pb-7">
                <div className="-mt-[52px] mb-4 size-26 shrink-0 rounded-full bg-hairline ring-6 ring-surface lg:-mt-[72px] lg:size-36" />
                <div className="space-y-2">
                  <div className="h-6 w-40 rounded bg-surface-raised" />
                  <div className="h-4 w-28 rounded bg-surface-raised" />
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
      <div className="flex h-full min-h-52 items-center justify-center rounded-[28px] bg-surface p-6 lg:rounded-tile">
        <p className="text-sm text-ink-dim">Could not load presence data</p>
      </div>
    );
  }

  const { presence, currentTrack, isRecentlyPlayed } = state;
  const spotifySource = presence.spotify ?? currentTrack;
  const fromApi = !presence.listeningToSpotify && currentTrack !== null;
  const spotify = spotifySource ? normalizeSpotify(spotifySource) : null;

  const user = {
    ...presence.user,
    displayNameStyles:
      presence.user.displayNameStyles ??
      discordProfile?.displayNameStyles ??
      null,
  };

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
  const cardStyle = compact
    ? {
        ...theme,
        background: `linear-gradient(90deg, color-mix(in srgb, ${themeColor2 ?? COMPACT_ACCENT_FALLBACK} 22%, transparent) 0%, var(--color-surface) 62%)`,
      }
    : theme;

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
      animate={{ borderRadius: cardRadius }}
      transition={compact ? PROFILE_COMPACT_TRANSITION : LAYOUT_TRANSITION}
      onLayoutAnimationComplete={onProfileLayoutAnimationComplete}
      className={compact ? 'relative h-[76px] lg:h-20' : 'relative h-full'}
    >
      <motion.div
        initial={false}
        animate={settleControls}
        style={cardStyle}
        className={
          compact
            ? 'relative flex h-full w-full origin-center items-center overflow-hidden rounded-[inherit] pr-3.5 pl-3 lg:pr-5 lg:pl-3.5'
            : 'relative flex h-full w-full origin-center flex-col overflow-hidden rounded-[inherit]'
        }
      >
        <PresenceNameplate
          nameplate={discordProfile?.collectibles?.nameplate ?? null}
          visible={compact && nameplateVisible}
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
                className="relative h-[132px] w-full shrink-0 overflow-hidden bg-black/10 lg:h-56"
              >
                <Image
                  src={bannerUrl}
                  alt="Discord banner"
                  fill
                  sizes="(max-width: 1024px) 100vw, 704px"
                  className="object-cover object-center"
                  preload
                  unoptimized={bannerUrl.includes('animated=true')}
                />
              </motion.div>
            ) : (
              <div
                key="banner-spacer"
                className="h-[132px] w-full shrink-0 bg-black/15 lg:h-56"
                style={
                  presence.user.bannerColor
                    ? { backgroundColor: presence.user.bannerColor }
                    : undefined
                }
              />
            ))}
        </AnimatePresence>

        <motion.div
          layout
          transition={LAYOUT_TRANSITION}
          className={
            compact
              ? 'relative z-20 flex min-w-0 flex-1 items-center gap-3 lg:gap-4'
              : 'relative z-20 flex flex-1 flex-col gap-3 px-5 pb-5 lg:gap-3.5 lg:px-8 lg:pb-7'
          }
        >
          <PresenceHeader
            user={user}
            status={presence.status}
            discordUserId={discordUserId}
            accentColor={themeColor2}
            compact={compact}
          />

          <PresenceIdentity
            user={user}
            status={presence.status}
            primaryGuild={presence.primaryGuild}
            customStatus={presence.customStatus}
            badges={discordProfile?.badges ?? []}
            bio={bio}
            activityCount={carouselItems.length}
            compact={compact}
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
                <div className="h-px bg-(--cft-sep)" />
                <div className="flex flex-1 flex-col justify-center pt-3 lg:pt-3.5">
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
