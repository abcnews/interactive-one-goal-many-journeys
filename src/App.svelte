<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { sineInOut } from "svelte/easing";
  import { ScrollState, ElementSize, watch, watchOnce, Previous } from "runed";
  import { interpolateNumber, interpolateZoom } from "d3-interpolate";
  import { parse, stringify } from "@abcnews/alternating-case-to-object";
  import { SvelteMap } from "svelte/reactivity";
  import { Match } from "effect";
  const { when, orElse } = Match;

  import { reducedMotion } from "@stores/reducedMotion.svelte";
  import { appState } from "@stores/appState.svelte";

  import Utils from "./components/Utils.svelte";
  import BackgroundStage from "./components/BackgroundStage.svelte";
  import LandingCollage from "./components/LandingCollage/LandingCollage.svelte";
  import Panels from "./components/Panels.svelte";
  import Globe from "./components/Globe.svelte";

  const BASE = 360;

  type Config = {
    zoom: number;
    lng: number;
    lat: number;
  };

  let config = new SvelteMap<string, Config>();

  config.set("initial", {
    zoom: 1,
    lng: 150.839167,
    lat: -33.753056,
  });

  config.set("start", {
    zoom: 2,
    lng: 150.839167,
    lat: -33.753056,
  });

  config.set("sydney", {
    zoom: 5,
    lng: 150.839167,
    lat: -33.753056,
  });

  config.set("brisbane", {
    zoom: 7,
    lng: 153.021072,
    lat: -27.470125,
  });

  const widthFromZoom = (zoom: number) => BASE / Math.pow(2, zoom);
  const zoomFromWidth = (width: number) => Math.log2(BASE / width);

  let windowInnerHeight = $state(600);
  const bodySize = new ElementSize(() => document.body);
  const scroll = new ScrollState({
    element: () => window,
  });

  let panelStates = $derived.by(() => {
    if (!bodySize.height) return []; // For reactivity mostly

    const panels = document.querySelectorAll(
      '[data-key^="panel"]',
    ) as NodeListOf<HTMLElement>;

    return Array.from(panels).map((panel) => {
      const parsedTag = parse(panel.dataset.tag || "");
      const { name } = parsedTag;

      return {
        name: name as string,
        top: panel.getBoundingClientRect().top + untrack(() => scroll.y),
      };
    });
  });

  const currentPanel = $derived(
    panelStates.findLast((panel) => scroll.y + windowInnerHeight > panel.top) ??
      null,
  );

  const progress = $derived.by(() => {
    if (!currentPanel) return 0;

    const totalDistance = window.innerHeight;
    const scrolled = scroll.y + window.innerHeight - currentPanel.top;

    return Math.min(1, Math.max(0, scrolled / totalDistance));
  });

  let targetConfig = $derived.by(() => {
    return config.get(currentPanel?.name ?? "initial") ?? config.get("initial");
  });

  let previousConfig = $derived.by(() => {
    const keys = [...config.keys()];
    const currentIndex = keys.indexOf(currentPanel?.name ?? "initial");
    if (currentIndex <= 0) return null;
    return config.get(keys[currentIndex - 1]);
  });

  type d3View = [number, number, number];

  let view = $derived.by(() => {
    const prev = previousConfig ?? targetConfig;
    const fromView: d3View = [
      prev?.lng ?? 150.839167,
      prev?.lat ?? -33.753056,
      widthFromZoom(prev?.zoom ?? 1),
    ];
    const toView: d3View = [
      targetConfig?.lng ?? 150.839167,
      targetConfig?.lat ?? -33.753056,
      widthFromZoom(targetConfig?.zoom ?? 1),
    ];

    const [cx, cy, width] = interpolateZoom(
      fromView,
      toView,
    )(sineInOut(progress));
    return { lng: cx, lat: cy, zoom: zoomFromWidth(width) };
  });

  // Start reactive observation of reduced motion toggle setting
  onMount(() => reducedMotion.observe());
</script>

<BackgroundStage>
  <Globe {view} />
</BackgroundStage>

<!-- <LandingCollage /> -->
<Panels />
<Utils />

<svelte:window
  bind:innerHeight={windowInnerHeight}
  onload={() => {
    console.log("Window loaded");
  }}
/>

<style lang="scss">
  :global(.maplibregl-map) {
    height: 100dvh;
  }
</style>
