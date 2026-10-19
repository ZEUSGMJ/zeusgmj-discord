const EDGE = 0.18;

const DISPLACEMENT_MAP = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="x" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgb(0,0,0)"/><stop offset="${EDGE}" stop-color="rgb(128,0,0)"/><stop offset="${1 - EDGE}" stop-color="rgb(128,0,0)"/><stop offset="1" stop-color="rgb(255,0,0)"/></linearGradient><linearGradient id="y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(0,0,0)"/><stop offset="${EDGE}" stop-color="rgb(0,128,0)"/><stop offset="${1 - EDGE}" stop-color="rgb(0,128,0)"/><stop offset="1" stop-color="rgb(0,255,0)"/></linearGradient></defs><rect width="100" height="100" fill="black"/><rect width="100" height="100" fill="url(#x)"/><rect width="100" height="100" fill="url(#y)" style="mix-blend-mode:screen"/></svg>`;

const MAP_URI = `data:image/svg+xml,${encodeURIComponent(DISPLACEMENT_MAP)}`;

export default function LiquidGlassDefs() {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      className="pointer-events-none absolute"
    >
      <filter
        id="liquid-glass"
        colorInterpolationFilters="sRGB"
        filterUnits="objectBoundingBox"
        x="0"
        y="0"
        width="1"
        height="1"
      >
        <feImage href={MAP_URI} preserveAspectRatio="none" result="map" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="frost" />
        <feDisplacementMap
          in="frost"
          in2="map"
          scale="10"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
