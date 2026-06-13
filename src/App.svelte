<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { sineInOut } from "svelte/easing";
  import { ScrollState } from "runed";
  import { interpolateZoom, interpolateNumber } from "d3-interpolate";
  import { parse } from "@abcnews/alternating-case-to-object";
  import { SvelteMap } from "svelte/reactivity";
  import * as v from "valibot";
  import { Match } from "effect";
  import { Spring } from "svelte/motion";

  import { reducedMotion } from "@stores/reducedMotion.svelte";
  import { pageState } from "@stores/pageState.svelte";
  import { appState } from "@stores/appState.svelte";

  import Utils from "./components/Utils.svelte";
  import BackgroundStage from "./components/BackgroundStage.svelte";
  import Panels from "./components/Panels.svelte";
  import Globe from "./components/Globe.svelte";
  import Image from "./components/Image.svelte";
  import Pictures from "./components/Pictures.svelte";

  import configData from "./assets/config.json";

  const { when, orElse } = Match;

  const BASE = 360;
  const UP_PAGE_THRESHOLD = 0.0; // No longer pushing trigger animations up so 0.0
  const SCROLL_OFFSET = 0.1; // fraction of window height
  const DESKTOP_BREAKPOINT = 900;

  const ConfigSchema = v.object({
    zoom: v.number(),
    desktopZoom: v.optional(v.number()),
    lng: v.number(),
    lat: v.number(),
    image: v.optional(v.string()),
    dot: v.optional(
      v.object({
        lng: v.number(),
        lat: v.number(),
      }),
    ),
    geojson: v.optional(v.string()),
    geojsons: v.optional(
      v.array(
        v.object({
          name: v.string(),
          fill: v.optional(v.string()),
          outline: v.optional(v.string()),
          outlineWidth: v.optional(v.number()),
        }),
      ),
    ),
    geoline: v.optional(
      v.object({
        from: v.tuple([v.number(), v.number()]),
        to: v.tuple([v.number(), v.number()]),
        color: v.optional(v.string()),
      }),
    ),
    staticDots: v.optional(
      v.array(
        v.object({
          id: v.string(),
          lng: v.number(),
          lat: v.number(),
          color: v.optional(v.string()),
        }),
      ),
    ),
    showArcs: v.optional(v.boolean()),
    dampenZoom: v.optional(v.number()),
  });

  const ConfigMapSchema = v.record(v.string(), ConfigSchema);

  type Config = v.InferOutput<typeof ConfigSchema>;

  const config = new SvelteMap<string, Config>(
    Object.entries(v.parse(ConfigMapSchema, configData)),
  );

  const INITIAL_ZOOM = 1;
  const INITIAL_LNG = 134.354806;
  const INITIAL_LAT = -25.610111;

  const initialConfig = config.get("initial") ?? {
    zoom: INITIAL_ZOOM,
    lng: INITIAL_LNG,
    lat: INITIAL_LAT,
  };

  const widthFromZoom = (zoom: number) => BASE / Math.pow(2, zoom);
  const zoomFromWidth = (width: number) => Math.log2(BASE / width);

  let windowInnerHeight = $state(600);
  let windowInnerWidth = $state(800);

  const scroll = new ScrollState({
    element: () => window,
  });

  $effect(() => {
    pageState.scrollY = scroll.y;
  });

  // Alternating case to object schema eg #startpanelNAMEsydneyZOOM100
  const PanelTagSchema = v.object({
    name: v.string(),
    zoom: v.optional(v.number()), // 100 percent = 1.0 zoom
    desktopzoom: v.optional(v.number()), // Same for Desktop
  });

  type PanelTag = v.InferOutput<typeof PanelTagSchema>;

  type PanelState = {
    index: number;
    name: string;
    top: number;
    config: Config | null;
  };

  function lngShortestPath(from: number, to: number): number {
    let delta = to - from;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return from + delta;
  }

  function filterMap<T, U>(
    arr: T[],
    fn: (item: T, index: number) => U | null,
  ): U[] {
    return arr.flatMap((item, i) => {
      const result = fn(item, i);
      return result ? [result] : [];
    });
  }

  function resolveZoom(config: Config): number {
    if (windowInnerWidth >= DESKTOP_BREAKPOINT && config.desktopZoom != null) {
      return config.desktopZoom;
    }
    return config.zoom;
  }

  function parsePanelState(
    panel: HTMLElement,
    scrollY: number,
    index: number,
  ): PanelState | null {
    const result = v.safeParse(PanelTagSchema, parse(panel.dataset.tag || ""));
    if (!result.success) return null;

    const panelTag: PanelTag = result.output;
    const {
      name,
      zoom: zoomOverride,
      desktopzoom: zoomDesktopOverride,
    } = panelTag;

    const baseConfig = config.get(name);
    if (!baseConfig) return null;

    const finalConfig: Config = {
      ...baseConfig,
      ...(zoomOverride !== undefined && { zoom: zoomOverride / 100 }),
      ...(zoomDesktopOverride !== undefined && {
        desktopZoom: zoomDesktopOverride / 100,
      }),
    };

    return {
      index,
      name,
      top: panel.getBoundingClientRect().top + scrollY,
      config: finalConfig,
    };
  }

  const panelStates: PanelState[] = $derived.by(() => {
    if (!pageState.bodySize.height) return [];

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

  const progress = $derived.by(() => {
    const panel = currentPanel ?? nextPanel;
    if (!panel) return 0;

    const totalDistance = window.innerHeight;
    const scrolled =
      scroll.y + windowInnerHeight * (1 - SCROLL_OFFSET) - panel.top;

    return Math.min(1, Math.max(0, scrolled / totalDistance));
  });

  let targetConfig = $derived.by(() => {
    return currentPanel?.config ?? nextPanel?.config ?? initialConfig;
  });

  let previousConfig = $derived.by(() => {
    if (!currentPanel) return initialConfig;

    const currentPanelIndex = panelStates.findIndex(
      (p) => p.index === currentPanel.index,
    );

    if (currentPanelIndex <= 0) return initialConfig;

    for (let i = currentPanelIndex - 1; i >= 0; i--) {
      const panel = panelStates[i];
      if (panel.config && panel.name !== currentPanel.name) return panel.config;
    }

    return initialConfig;
  });

  type d3View = [number, number, number];

  let view = $derived.by(() => {
    const prev = previousConfig ?? targetConfig;
    const fromView: d3View = [
      prev.lng,
      prev.lat,
      widthFromZoom(resolveZoom(prev)),
    ];
    const toView: d3View = [
      // We might still do shortest path. Keep function around...
      targetConfig.lng, //lngShortestPath(prev.lng, targetConfig.lng),
      targetConfig.lat,
      widthFromZoom(resolveZoom(targetConfig)),
    ];

    const t = sineInOut(progress);
    const [zx, zy, zw] = interpolateZoom(fromView, toView)(t);

    const targetWidth = interpolateNumber(fromView[2], toView[2])(t);

    // Dampen the zoom-out by pulling width toward a weighted average of from/to widths
    // 0 = no swoop (linear), 1 = full interpolateZoom swoop
    const dampen = targetConfig.dampenZoom ?? 1;
    const width = targetWidth + (zw - targetWidth) * dampen;

    return { lng: zx, lat: zy, zoom: zoomFromWidth(width) };
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

  $effect(() => {
    appState.setWindowInnerWidth(windowInnerWidth);
  });

  $inspect(currentPanel)
</script>

<BackgroundStage>
  <Globe
    view={reducedMotion.current ? viewReducedMotion : view}
    dotLocation={currentWithThreshold.dot ?? null}
    geojson={currentWithThreshold.geojson ?? null}
    geojsons={currentWithThreshold.geojsons}
    geoline={currentWithThreshold.geoline ?? null}
    staticDots={currentWithThreshold.staticDots ?? []}
    panelName={currentPanel ? currentPanel.name : null}
    showArcs={currentWithThreshold.showArcs}
  />
</BackgroundStage>

<!-- <LandingCollage /> -->
<Image imageName={backgroundImage.name} />
<Panels />
<Utils />
<Pictures />

<svelte:window
  bind:innerHeight={windowInnerHeight}
  bind:innerWidth={windowInnerWidth}
/>

<style lang="scss">
  :global(.maplibregl-map) {
    height: 100dvh;
  }
</style>
