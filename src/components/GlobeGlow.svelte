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
    color = "100, 160, 255",
    intensity = 0.5,
    scale = 10,
    blur = 40,
  }: Props = $props();

  let baseSize = $state(0);

  let glowSize = $state(500);
  let glowX = $state(0);
  let glowY = $state(0);
  let canvasSize = $state(500); // track viewport size for ratio

  const lerpFactor = 0.2;
  const displaySize = $derived(baseSize + (glowSize - baseSize) * lerpFactor);

  // Fade out as globe fills more of the screen
  const dynamicIntensity = $derived(
    intensity * Math.min(1, (canvasSize * 0.25) / glowSize),
  );

  const { map } = getMapContext();

  function updateGlow() {
    const m = map;
    if (!m) return;

    const centre = m.project([0, 0]);
    const edge = m.project([90, 0]);
    const radius = Math.abs(edge.x - centre.x);
    const diameter = radius * 2;

    // Capture the initial size once
    if (baseSize === 0) baseSize = diameter;

    glowSize = diameter; // still need this for centering

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

<div
  class="globe-glow"
  style="
    width: {displaySize * scale}px;
    height: {displaySize * scale}px;
    left: {glowX}px;
    top: {glowY}px;
    --glow-color: {color};
    --glow-intensity: {dynamicIntensity};
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
      rgba(var(--glow-color), var(--glow-intensity)) 0%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.4)) 25%,
      transparent 45%
    );
    filter: blur(var(--glow-blur));
    pointer-events: none;
    z-index: 0;
  }
</style>
