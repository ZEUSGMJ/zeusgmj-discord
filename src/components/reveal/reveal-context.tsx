'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MotionConfig, useReducedMotion } from 'motion/react';
import { FOOTER_COLLAPSE_PRELUDE_DELAY } from '@/components/reveal/timing';

export type ProfileSettleDirection = 'expanded' | 'collapsed';

export interface ProfileSettleEvent {
  revision: number;
  generation: number;
  direction: ProfileSettleDirection;
}

interface RevealContextValue {
  targetExpanded: boolean;
  detailsMounted: boolean;
  layoutExpanded: boolean;
  intentGeneration: number;
  nameplateAvailable: boolean;
  nameplateVisible: boolean;
  footerExitPending: boolean;
  footerExitCancelled: boolean;
  profileSettle: ProfileSettleEvent | null;
  toggle: () => void;
  collapse: () => void;
  registerNameplate: (available: boolean) => void;
  onDetailsEnterComplete: (generation: number) => void;
  onDetailsExitComplete: () => void;
  onProfileLayoutAnimationComplete: () => void;
}

const RevealContext = createContext<RevealContextValue | null>(null);

export function RevealProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [targetExpanded, setTargetExpanded] = useState(false);
  const [detailsMounted, setDetailsMounted] = useState(false);
  const [layoutExpanded, setLayoutExpanded] = useState(false);
  const [intentGeneration, setIntentGeneration] = useState(0);
  const [nameplateAvailable, setNameplateAvailable] = useState(false);
  const [nameplateVisible, setNameplateVisible] = useState(false);
  const [footerExitPending, setFooterExitPending] = useState(false);
  const [footerExitCancelled, setFooterExitCancelled] = useState(false);
  const [profileSettle, setProfileSettle] = useState<ProfileSettleEvent | null>(
    null,
  );
  const intentRef = useRef(0);
  const targetRef = useRef(targetExpanded);
  const detailsRef = useRef(detailsMounted);
  const layoutRef = useRef(layoutExpanded);
  const nameplateRef = useRef(nameplateAvailable);
  const footerExitPendingRef = useRef(false);
  const settleRevisionRef = useRef(0);
  const settledExpansionRef = useRef<number | null>(null);
  const pendingCollapseSettleRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    targetRef.current = targetExpanded;
    detailsRef.current = detailsMounted;
    layoutRef.current = layoutExpanded;
    nameplateRef.current = nameplateAvailable;
  }, [detailsMounted, layoutExpanded, nameplateAvailable, targetExpanded]);

  const clearPending = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const commitIntent = useCallback(
    (next: boolean) => {
      const generation = intentRef.current + 1;
      intentRef.current = generation;
      targetRef.current = next;
      setIntentGeneration(generation);
      clearPending();
      footerExitPendingRef.current = false;
      setFooterExitPending(false);
      setFooterExitCancelled(false);
      setTargetExpanded(next);
      pendingCollapseSettleRef.current = null;

      if (next) {
        setNameplateVisible(false);
        const delay = nameplateRef.current && !reduceMotion ? 140 : 0;
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          if (intentRef.current !== generation || !targetRef.current) return;
          layoutRef.current = true;
          detailsRef.current = true;
          setLayoutExpanded(true);
          setDetailsMounted(true);
        }, delay);
        return;
      }

      if (!layoutRef.current && nameplateRef.current) setNameplateVisible(true);

      if (!detailsRef.current || reduceMotion) {
        detailsRef.current = false;
        setDetailsMounted(false);
        return;
      }

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (intentRef.current !== generation || targetRef.current) return;
        detailsRef.current = false;
        setDetailsMounted(false);
      }, 100);
    },
    [clearPending, reduceMotion],
  );

  const setIntent = useCallback(
    (next: boolean) => {
      if (next && footerExitPendingRef.current) {
        clearPending();
        footerExitPendingRef.current = false;
        setFooterExitPending(false);
        setFooterExitCancelled(true);
        return;
      }

      if (!next && targetRef.current && detailsRef.current && !reduceMotion) {
        if (footerExitPendingRef.current) return;

        clearPending();
        footerExitPendingRef.current = true;
        setFooterExitPending(true);
        setFooterExitCancelled(false);
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          if (!footerExitPendingRef.current || !targetRef.current) return;
          commitIntent(false);
        }, FOOTER_COLLAPSE_PRELUDE_DELAY * 1000);
        return;
      }

      commitIntent(next);
    },
    [clearPending, commitIntent, reduceMotion],
  );

  const toggle = useCallback(() => {
    setIntent(footerExitPendingRef.current || !targetRef.current);
  }, [setIntent]);

  const collapse = useCallback(() => {
    setIntent(false);
  }, [setIntent]);

  const registerNameplate = useCallback((available: boolean) => {
    nameplateRef.current = available;
    setNameplateAvailable(available);
    if (!available) {
      setNameplateVisible(false);
      return;
    }
    if (!targetRef.current && !layoutRef.current) setNameplateVisible(true);
  }, []);

  const emitProfileSettle = useCallback(
    (direction: ProfileSettleDirection, generation: number) => {
      if (reduceMotion || generation !== intentRef.current) return;
      settleRevisionRef.current += 1;
      setProfileSettle({
        revision: settleRevisionRef.current,
        generation,
        direction,
      });
    },
    [reduceMotion],
  );

  const onDetailsEnterComplete = useCallback(
    (generation: number) => {
      if (
        generation !== intentRef.current ||
        settledExpansionRef.current === generation ||
        !targetRef.current ||
        !layoutRef.current
      )
        return;

      settledExpansionRef.current = generation;
      emitProfileSettle('expanded', generation);
    },
    [emitProfileSettle],
  );

  const onDetailsExitComplete = useCallback(() => {
    if (targetRef.current || !layoutRef.current) return;
    pendingCollapseSettleRef.current = reduceMotion ? null : intentRef.current;
    layoutRef.current = false;
    setLayoutExpanded(false);
    if (reduceMotion && nameplateRef.current) setNameplateVisible(true);
  }, [reduceMotion]);

  const onProfileLayoutAnimationComplete = useCallback(() => {
    if (targetRef.current || layoutRef.current) return;
    if (nameplateRef.current) setNameplateVisible(true);

    const generation = pendingCollapseSettleRef.current;
    pendingCollapseSettleRef.current = null;
    if (generation === null) return;
    emitProfileSettle('collapsed', generation);
  }, [emitProfileSettle]);

  useEffect(() => clearPending, [clearPending]);

  return (
    <MotionConfig reducedMotion="user">
      <RevealContext.Provider
        value={{
          targetExpanded,
          detailsMounted,
          layoutExpanded,
          intentGeneration,
          nameplateAvailable,
          nameplateVisible,
          footerExitPending,
          footerExitCancelled,
          profileSettle,
          toggle,
          collapse,
          registerNameplate,
          onDetailsEnterComplete,
          onDetailsExitComplete,
          onProfileLayoutAnimationComplete,
        }}
      >
        {children}
      </RevealContext.Provider>
    </MotionConfig>
  );
}

export function useReveal() {
  const context = useContext(RevealContext);

  if (!context) {
    throw new Error('useReveal must be used within RevealProvider');
  }

  return context;
}
