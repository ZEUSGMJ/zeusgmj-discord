export default function ThemeBackground() {
  return (
    <div
      aria-hidden={true}
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 90% 90% at 100% 100%, color-mix(in srgb, var(--theme-page-accent, var(--color-background)) 70%, transparent) 0%, color-mix(in srgb, var(--theme-page-accent, var(--color-background)) 32%, transparent) 32%, transparent 68%), var(--color-background)',
      }}
    />
  )
}
