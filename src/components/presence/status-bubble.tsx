import { motion, useReducedMotion } from 'motion/react';
import { hasCustomStatus, type NormalizedPresence } from '@/lib/lanyard.shared';
import StatusEmoji from '@/components/presence/status-emoji';
import { CONTENT_ENTER_TRANSITION } from '@/components/reveal/timing';

export default function StatusBubble({
  customStatus,
}: {
  customStatus: NormalizedPresence['customStatus'];
}) {
  const reduceMotion = useReducedMotion() ?? false;

  if (!hasCustomStatus(customStatus)) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: reduceMotion ? { duration: 0 } : CONTENT_ENTER_TRANSITION,
      }}
      className="liquid-glass relative flex w-fit max-w-full items-start gap-1.5 rounded-2xl bg-(--cft-status-bg) px-3 py-2 backdrop-blur-sm [--glass-brightness:0.7] [--glass-tint:rgb(8_8_20/0.62)]"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-0.5 -left-3.5 size-3 rounded-full bg-(--cft-status-bg)"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-1 -left-6 size-1.5 rounded-full bg-(--cft-status-bg)"
      />
      <StatusEmoji customStatus={customStatus} className="size-5 text-base" />
      {customStatus.text && (
        <p
          title={customStatus.text}
          className="line-clamp-2 min-w-0 text-[13px] leading-5 text-(--cft-hi) lg:text-sm"
        >
          {customStatus.text}
        </p>
      )}
    </motion.div>
  );
}
