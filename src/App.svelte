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
  const UP_PAGE_THRESHOLD = 0.0; // No longer pushing trigger animations up so 0.0
  const SCROLL_OFFSET = 0.1; // fraction of window height

  const ConfigSchema = v.object({
    globe: v.optional(v.boolean()),
    zoom: v.number(),
    lng: v.number(),
    lat: v.number(),
    image: v.optional(v.string()),
    dot: v.optional(
      v.object({
        lng: v.number(),
        lat: v.number(),
      }),
    ),
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
    index: number;
    name: string;
    top: number;
    config: Config | null;
  };

  function filterMap<T, U>(
    arr: T[],
    fn: (item: T, index: number) => U | null,
  ): U[] {
    return arr.flatMap((item, i) => {
      const result = fn(item, i);
      return result ? [result] : [];
    });
  }

  function parsePanelState(
    panel: HTMLElement,
    scrollY: number,
    index: number,
  ): PanelState | null {
    const result = v.safeParse(PanelTagSchema, parse(panel.dataset.tag || ""));
    if (!result.success) return null;

    const name = result.output.name;
    return {
      index,
      name,
      top: panel.getBoundingClientRect().top + scrollY,
      config: config.get(name) ?? null,
    };
  }

  const panelStates: PanelState[] = $derived.by(() => {
    if (!bodySize.height) return [];

    const currentScrollY = untrack(() => scroll.y);
    const panels = Array.from(
      document.querySelectorAll(
        '[data-key^="panel"]',
      ) as NodeListOf<HTMLElement>,
    );

    return filterMap(panels, (panel, i) =>
      parsePanelState(panel, currentScrollY, i),
    );
  });

  const currentPanel = $derived(
    panelStates.findLast(
      (panel) => scroll.y + windowInnerHeight * (1 - SCROLL_OFFSET) > panel.top,
    ) ?? null,
  );

  const nextPanel = $derived(
    panelStates.find(
      (panel) =>
        scroll.y + windowInnerHeight * (1 - SCROLL_OFFSET) <= panel.top,
    ) ?? null,
  );

  // const currentPanel = $derived(
  //   panelStates.findLast((panel) => scroll.y + windowInnerHeight > panel.top) ??
  //     null,
  // );

  // const nextPanel = $derived(
  //   panelStates.find((panel) => scroll.y + windowInnerHeight <= panel.top) ??
  //     null,
  // );

  const progress = $derived.by(() => {
    const panel = currentPanel ?? nextPanel;
    if (!panel) return 0;

    const totalDistance = window.innerHeight;
    const scrolled =
      scroll.y + windowInnerHeight * (1 - SCROLL_OFFSET) - panel.top;

    return Math.min(1, Math.max(0, scrolled / totalDistance));
    // if (!currentPanel) return 0;

    // const totalDistance = window.innerHeight;
    // const scrolled = scroll.y + window.innerHeight - currentPanel.top;

    // return Math.min(1, Math.max(0, scrolled / totalDistance));
  });

  let targetConfig = $derived.by(() => {
    return currentPanel?.config ?? nextPanel?.config ?? initialConfig;
  });

  let previousConfig = $derived.by(() => {
    const currentIndex = currentPanel?.index ?? -1;
    if (currentIndex <= 0) return initialConfig;

    for (let i = currentIndex - 1; i >= 0; i--) {
      const cfg = panelStates[i].config;
      if (cfg && panelStates[i].name !== currentPanel?.name) return cfg;
    }
    return initialConfig;
  });

  // const ZOOM_START = 0.3;
  // const ZOOM_END = 1.0;

  // function remapProgress(p: number, start: number, end: number): number {
  //   return Math.min(1, Math.max(0, (p - start) / (end - start)));
  // }

  type d3View = [number, number, number];

  let view = $derived.by(() => {
    // const prev = previousConfig ?? targetConfig;
    // const fromView: d3View = [prev.lng, prev.lat, widthFromZoom(prev.zoom)];
    // const toView: d3View = [
    //   targetConfig.lng,
    //   targetConfig.lat,
    //   widthFromZoom(targetConfig.zoom),
    // ];

    // const remapped = remapProgress(progress, ZOOM_START, ZOOM_END);

    // const [cx, cy, width] = interpolateZoom(
    //   fromView,
    //   toView,
    // )(sineInOut(remapped));
    // return { lng: cx, lat: cy, zoom: zoomFromWidth(width) };

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
  <Globe
    view={reducedMotion.current ? viewReducedMotion : view}
    dotLocation={currentWithThreshold.dot ?? null}
  />
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
