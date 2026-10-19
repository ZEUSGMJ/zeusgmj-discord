'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  useLanyardPresence,
  type LoadState,
} from '@/hooks/use-lanyard-presence';
import type { DiscordProfileData } from '@/lib/discord-profile.shared';
import { intToHex } from '@/lib/discord-profile.shared';
import {
  HEX_COLOR,
  hexToLuminance,
  liftToContrast,
  readableOn,
} from '@/lib/contrast.shared';
import { TILE_SURFACE } from '@/lib/tile-color.shared';

interface PresenceContextValue {
  state: LoadState;
  userId: string | undefined;
  discordProfile: DiscordProfileData | null;
  themeColor1: string | null;
  themeColor2: string | null;
  themeColor: string;
}

const PresenceContext = createContext<PresenceContextValue | null>(null);
const DISCORD_USER_ID = process.env.NEXT_PUBLIC_DISCORD_USER_ID;

export function PresenceProvider({ children }: { children: ReactNode }) {
  const state = useLanyardPresence(DISCORD_USER_ID);
  const [discordProfile, setDiscordProfile] =
    useState<DiscordProfileData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/discord-profile', { signal: controller.signal })
      .then((response) =>
        response.ok ? (response.json() as Promise<DiscordProfileData>) : null,
      )
      .then((data) => setDiscordProfile(data))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const themeColor1 = discordProfile?.themeColors
    ? intToHex(discordProfile.themeColors[0])
    : null;
  const profileColor2 = discordProfile?.themeColors
    ? intToHex(discordProfile.themeColors[1])
    : null;
  const bannerColor =
    state.phase === 'loaded' &&
    HEX_COLOR.test(state.presence.user.bannerColor ?? '')
      ? state.presence.user.bannerColor
      : null;
  const themeColor = themeColor1 ?? bannerColor ?? '#71717B';
  const themeColor2 = profileColor2 ?? themeColor;

  useEffect(() => {
    const root = document.documentElement.style;
    const accentInk = HEX_COLOR.test(themeColor2)
      ? liftToContrast(themeColor2, [hexToLuminance(TILE_SURFACE)], 3)
      : themeColor2;
    root.setProperty('--theme-primary', themeColor);
    root.setProperty('--theme-accent', themeColor2);
    root.setProperty('--theme-accent-ink', accentInk);
    root.setProperty(
      '--theme-accent-on',
      HEX_COLOR.test(accentInk) ? readableOn(accentInk) : '#07080a',
    );
  }, [themeColor, themeColor2]);

  return (
    <PresenceContext.Provider
      value={{
        state,
        userId: DISCORD_USER_ID,
        discordProfile,
        themeColor1,
        themeColor2,
        themeColor,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);

  if (!context) {
    throw new Error('usePresence must be used within PresenceProvider');
  }

  return context;
}
