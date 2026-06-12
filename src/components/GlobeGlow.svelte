<!-- THIS IS FRUSTRATINGLY BROKEN DO NOT USE -->

<script lang="ts">
  import { getMapContext } from "svelte-maplibre-gl";
  import { onMount } from "svelte";

  type Props = {
    color?: string;
    intensity?: number;
    glowWidth?: number; // how many px wide the halo extends beyond the globe edge
    blur?: number;
  };

  let {
    color = "120, 200, 255",
    intensity = 0.2,
    glowWidth = 200, // fixed px, doesn't scale with zoom
    blur = 10,
  }: Props = $props();

  let diameter = $state(0);
  let glowX = $state(0);
  let glowY = $state(0);
  let canvasSize = $state(500);

  const { map } = getMapContext();

  // As the globe grows relative to the canvas, fade the glow out.
  // fillRatio hits 1.0 when the globe diameter equals the canvas — fully zoomed in.
  const fillRatio = $derived(canvasSize > 0 ? diameter / canvasSize : 0);
  const dynamicIntensity = $derived(intensity * Math.max(0, 1 - fillRatio));

  function updateGlow() {
    const m = map;
    if (!m) return;

    const canvas = m.getCanvas();
    const tr = m.transform;

    // Globe radius in pixels — directly from the transform, unaffected by rotation/pan
    // @ts-ignore
    const r = tr.globeRadius ?? tr._globeRadius;

    if (r != null) {
      diameter = r * 2;
    } else {
      // non-globe projection fallback
      const centre = m.project([0, 0]);
      const pole = m.project([0, 90]);
      diameter = Math.abs(pole.y - centre.y) * 2;
    }

    // Always use the globe diameter itself as the reference — not canvas size
    glowX = canvas.offsetWidth / 2;
    glowY = canvas.offsetHeight / 2;
    canvasSize = diameter; // <-- key fix: ratio is now globe-relative, not screen-relative
  }

  onMount(() => {
    const m = map;
    if (!m) return;

    m.on("zoom", updateGlow);
    // m.on("move", updateGlow);  <-- remove this, causes spin artifacts
    m.on("resize", updateGlow);
    m.on("load", updateGlow);

    if (m.isStyleLoaded()) updateGlow();

    return () => {
      m.off("zoom", updateGlow);
      m.off("resize", updateGlow);
      m.off("load", updateGlow);
    };
  });
</script>

<div
  class="globe-glow"
  style="
    width: {diameter + glowWidth * 2}px;
    height: {diameter + glowWidth * 2}px;
    left: {glowX}px;
    top: {glowY}px;
    --glow-color: {color};
    --glow-intensity: {dynamicIntensity};
    --glow-blur: {blur}px;
    --globe-radius: {diameter / 2}px;
    --glow-width: {glowWidth}px;
  "
></div>

<style>
  .globe-glow {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(
      circle,
      transparent calc(var(--globe-radius) * 0.7),
      rgba(var(--glow-color), var(--glow-intensity)) var(--globe-radius),
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.5))
        calc(var(--globe-radius) + var(--glow-width) * 0.4),
      transparent calc(var(--globe-radius) + var(--glow-width))
    );
    filter: blur(var(--glow-blur));
    pointer-events: none;
    z-index: 0;
  }
</style>
