'use client';

import { useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import Image from 'next/image';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import {
  remarkDiscordConstructs,
  remarkDiscordEmoji,
  remarkDiscordSpoiler,
  remarkDiscordSubtext,
  remarkDiscordUnderline,
} from '@/lib/discord-markdown.shared';

function Spoiler({ children }: { children?: ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => setRevealed(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setRevealed(true);
        }
      }}
      className={
        revealed
          ? 'rounded bg-(--cft-badge-bg) px-0.5'
          : 'cursor-pointer rounded bg-(--cft-badge-bg) px-0.5 text-transparent select-none'
      }
    >
      {children}
    </span>
  );
}

function BioImage({ src, alt }: ComponentPropsWithoutRef<'img'>) {
  if (typeof src !== 'string') return null;

  let host: string;
  try {
    host = new URL(src).hostname;
  } catch {
    return null;
  }
  if (host !== 'cdn.discordapp.com') return null;

  return (
    <Image
      src={src}
      alt={alt ?? ''}
      width={20}
      height={20}
      className="inline-block h-5 w-5 align-text-bottom"
      unoptimized
    />
  );
}

export default function BioMarkdown({ bio }: { bio: string }) {
  return (
    <div className="mt-1 space-y-1">
      <Markdown
        remarkPlugins={[
          remarkDiscordConstructs,
          remarkGfm,
          remarkBreaks,
          remarkDiscordUnderline(bio),
          remarkDiscordSpoiler,
          remarkDiscordSubtext,
          remarkDiscordEmoji,
        ]}
        disallowedElements={[
          'table',
          'thead',
          'tbody',
          'tr',
          'td',
          'th',
          'input',
          'sup',
          'section',
        ]}
        unwrapDisallowed
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="wrap-break-word text-(--cft-hi) underline decoration-(--cft-dim) underline-offset-2 transition-opacity hover:opacity-80"
            >
              {children}
            </a>
          ),
          p: ({ children }) => (
            <p className="text-sm wrap-break-word text-(--cft-lo)">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-(--cft-hi)">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          u: ({ children }) => (
            <u className="underline underline-offset-2">{children}</u>
          ),
          del: ({ children }) => (
            <del className="line-through opacity-70">{children}</del>
          ),
          code: ({ children, className }) => (
            <code
              className={
                className
                  ? 'block overflow-x-auto rounded bg-(--cft-badge-bg) px-2 py-1 font-mono text-xs'
                  : 'rounded bg-(--cft-badge-bg) px-1 py-0.5 font-mono text-xs'
              }
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="max-w-full overflow-x-auto">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-(--cft-sep) pl-2 text-sm text-(--cft-lo)">
              {children}
            </blockquote>
          ),
          small: ({ children }) => (
            <small className="text-xs text-(--cft-dim)">{children}</small>
          ),
          img: BioImage,
          // @ts-expect-error -- discord-spoiler is a synthetic element name from remarkDiscordSpoiler
          'discord-spoiler': Spoiler,
        }}
      >
        {bio}
      </Markdown>
    </div>
  );
}
