export default function ThemeBackground() {
  return (
    <div
      aria-hidden={true}
      className="pointer-events-none fixed inset-0 -z-10 animate-fade-in"
      style={{
        background:
          'radial-gradient(ellipse 90vw 90vh at 100% 100%, color-mix(in srgb, var(--theme-page-accent, var(--color-background)) 70%, transparent) 0%, color-mix(in srgb, var(--theme-page-accent, var(--color-background)) 32%, transparent) 32%, transparent 68%), var(--color-background)',
      }}
    />
  )
}
