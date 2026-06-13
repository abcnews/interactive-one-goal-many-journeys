<script lang="ts">
  import { getMapContext } from "svelte-maplibre-gl";
  import { onMount } from "svelte";

  type Props = {
    color?: string;
    intensity?: number;
    spread?: number; // how far the glow extends beyond the globe, as a multiplier
    blur?: number;
  };

  let {
    color = "120, 200, 255",
    intensity = 0.2,
    spread = 1.1, // glow div is spread× the globe diameter
    blur = 40,
  }: Props = $props();

  let diameter = $state(0);
  let glowX = $state(0);
  let glowY = $state(0);

  const { map } = getMapContext();

  // Only fades on zoom, not pan/spin
  const zoomIntensity = $derived(
    diameter > 0
      ? intensity * Math.max(0, 1 - (diameter / 800) ** 2)
      : intensity,
  );

  function updateGlow() {
    const m = map;
    if (!m) return;

    // @ts-ignore — internal but stable
    const r = m.transform.globeRadius ?? m.transform._globeRadius;

    if (r != null) {
      diameter = r * 2;
    } else {
      // fallback: pole is rotation-invariant unlike [90, 0]
      const centre = m.project([0, 0]);
      const pole = m.project([0, 90]);
      diameter = Math.abs(pole.y - centre.y) * 2;
    }

    const canvas = m.getCanvas();
    glowX = canvas.offsetWidth / 2;
    glowY = canvas.offsetHeight / 2;
  }

  onMount(() => {
    const m = map;
    if (!m) return;

    // No "move" — glow only responds to zoom and resize
    m.on("zoom", updateGlow);
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
    width: {diameter * spread}px;
    height: {diameter * spread}px;
    left: {glowX}px;
    top: {glowY}px;
    --glow-color: {color};
    --glow-intensity: {zoomIntensity};
    --globe-r: {diameter / 2}px;
    --glow-blur: {blur}px;
  "
></div>

<style>
  .globe-glow {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(
      circle,
      transparent calc(var(--globe-r) * 0.75),
      rgba(var(--glow-color), var(--glow-intensity)) var(--globe-r),
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.3))
        calc(var(--globe-r) * 1.3),
      transparent calc(var(--globe-r) * 1.6)
    );
    filter: blur(var(--glow-blur));
    will-change: transform;
    -webkit-transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 0;
  }
</style>
