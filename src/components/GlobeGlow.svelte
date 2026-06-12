<script lang="ts">
  import { getMapContext } from "svelte-maplibre-gl";
  import { onMount } from "svelte";

  type Props = {
    color?: string;
    intensity?: number;
    scale?: number;
    blur?: number;
  };

  let {
    color = "120, 200, 255",
    intensity = 0.3,
    scale = 8,
    blur = 20,
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

    const centre = m.project([0, 0]);
    const edge = m.project([90, 0]);
    diameter = Math.abs(edge.x - centre.x) * 2;

    const canvas = m.getCanvas();
    glowX = canvas.offsetWidth / 2;
    glowY = canvas.offsetHeight / 2;
    canvasSize = Math.min(canvas.offsetWidth, canvas.offsetHeight);
  }

  onMount(() => {
    const m = map;
    if (!m) return;

    m.on("zoom", updateGlow);
    m.on("move", updateGlow);
    m.on("resize", updateGlow);
    m.on("load", updateGlow);

    if (m.isStyleLoaded()) updateGlow();

    return () => {
      m.off("zoom", updateGlow);
      m.off("move", updateGlow);
      m.off("resize", updateGlow);
      m.off("load", updateGlow);
    };
  });
</script>

<!-- Ambient glow — large, soft, fades with zoom -->
<div
  class="globe-glow"
  style="
    width: {diameter * scale}px;
    height: {diameter * scale}px;
    left: {glowX}px;
    top: {glowY}px;
    --glow-color: {color};
    --glow-intensity: {dynamicIntensity};
    --glow-blur: {blur}px;
  "
></div>

<!-- Rim light — tight to the globe edge, almost solid -->
<div
  class="globe-rim"
  style="
    width: {diameter}px;
    height: {diameter}px;
    left: {glowX}px;
    top: {glowY}px;
    --glow-color: {color};
    --glow-intensity: {dynamicIntensity};
  "
></div>

<style>
  .globe-glow {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(var(--glow-color), var(--glow-intensity)) 0%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.4)) 25%,
      transparent 45%
    );
    filter: blur(var(--glow-blur));
    pointer-events: none;
    z-index: 0;
  }

  .globe-rim {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(
      circle,
      transparent 82%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 2)) 90%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 3)) 95%,
      rgba(var(--glow-color), var(--glow-intensity)) 100%
    );
    filter: blur(2px);
    pointer-events: none;
    z-index: 0;
  }
</style>
