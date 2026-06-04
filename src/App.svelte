<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { sineInOut } from "svelte/easing";
  import { ScrollState, ElementSize, watch, watchOnce, Previous } from "runed";
  import { interpolateNumber, interpolateZoom } from "d3-interpolate";
  import { parse, stringify } from "@abcnews/alternating-case-to-object";
  import { SvelteMap } from "svelte/reactivity";
  import * as v from "valibot";
  import { Match } from "effect";

  import { reducedMotion } from "@stores/reducedMotion.svelte";
  import { appState } from "@stores/appState.svelte";

  import Utils from "./components/Utils.svelte";
  import BackgroundStage from "./components/BackgroundStage.svelte";
  import LandingCollage from "./components/LandingCollage/LandingCollage.svelte";
  import Panels from "./components/Panels.svelte";
  import Globe from "./components/Globe.svelte";
  import Image from "./components/Image.svelte";

  import configData from "./assets/config.json";

  const { when, orElse } = Match;

  const BASE = 360;
  const UP_PAGE_THRESHOLD = 0.3;

  const ConfigSchema = v.object({
    globe: v.optional(v.boolean()),
    zoom: v.number(),
    lng: v.number(),
    lat: v.number(),
    image: v.optional(v.string()),
  });

  const ConfigMapSchema = v.record(v.string(), ConfigSchema);

  type Config = v.InferOutput<typeof ConfigSchema>;

  const config = new SvelteMap<string, Config>(
    Object.entries(v.parse(ConfigMapSchema, configData)),
  );

  // Assume always defined, for typing (be sure it is!)
  const initialConfig = config.get("initial")!;

  const widthFromZoom = (zoom: number) => BASE / Math.pow(2, zoom);
  const zoomFromWidth = (width: number) => Math.log2(BASE / width);

  let windowInnerHeight = $state(600);
  const bodySize = new ElementSize(() => document.body);
  const scroll = new ScrollState({
    element: () => window,
  });

  const PanelTagSchema = v.object({
    name: v.string(),
  });

  type PanelState = {
    name: string;
    top: number;
  };

  function filterMap<T, U>(arr: T[], fn: (item: T) => U | null): U[] {
    return arr.flatMap((item) => {
      const result = fn(item);
      return result ? [result] : [];
    });
  }

  function parsePanelState(
    panel: HTMLElement,
    scrollY: number,
  ): PanelState | null {
    const result = v.safeParse(PanelTagSchema, parse(panel.dataset.tag || ""));
    if (!result.success) return null;

    return {
      name: result.output.name,
      top: panel.getBoundingClientRect().top + scrollY,
    };
  }

  let panelStates: PanelState[] = $derived.by(() => {
    if (!bodySize.height) return []; // For reactivity mostly

    const currentScrollY = untrack(() => scroll.y);
    const panels = Array.from(
      document.querySelectorAll(
        '[data-key^="panel"]',
      ) as NodeListOf<HTMLElement>,
    );

    return filterMap(panels, (panel) => parsePanelState(panel, currentScrollY));
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
    return config.get(currentPanel?.name ?? "initial") ?? initialConfig;
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
    const fromView: d3View = [prev.lng, prev.lat, widthFromZoom(prev.zoom)];
    const toView: d3View = [
      targetConfig.lng,
      targetConfig.lat,
      widthFromZoom(targetConfig.zoom),
    ];

    const [cx, cy, width] = interpolateZoom(
      fromView,
      toView,
    )(sineInOut(progress));
    return { lng: cx, lat: cy, zoom: zoomFromWidth(width) };
  });

  const currentWithThreshold = $derived(
    progress > UP_PAGE_THRESHOLD
      ? targetConfig
      : (previousConfig ?? targetConfig),
  );

  let viewReducedMotion = $derived.by(() => {
    return {
      lng: currentWithThreshold.lng,
      lat: currentWithThreshold.lat,
      zoom: currentWithThreshold.zoom,
    };
  });

  let backgroundImage = $derived.by(() => {
    return {
      name: currentWithThreshold.image ?? null,
    };
  });

  // Start reactive observation of reduced motion toggle setting
  onMount(() => reducedMotion.observe());
</script>

<BackgroundStage>
  <Globe view={reducedMotion.current ? viewReducedMotion : view} />
</BackgroundStage>

<!-- <LandingCollage /> -->
<Image imageName={backgroundImage.name} />
<Panels />
<Utils />

<svelte:window bind:innerHeight={windowInnerHeight} />

<style lang="scss">
  :global(.maplibregl-map) {
    height: 100dvh;
  }
</style>
