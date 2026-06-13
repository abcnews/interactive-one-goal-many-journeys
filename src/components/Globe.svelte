<script lang="ts">
  import { SvelteMap } from "svelte/reactivity";
  import type { Map, LngLatLike } from "maplibre-gl";
  import {
    MapLibre,
    Projection,
    Sky,
    Light,
    AttributionControl,
    GeoJSONSource,
    SymbolLayer,
  } from "svelte-maplibre-gl";
  import { untrack } from "svelte";
  import { Spring } from "svelte/motion";

  import mapStyles from "../assets/mapStyles/socceroos_dark-mode_v910.json?url";
  import PulsingDot from "./PulsingDot.svelte";
  import GeoJsonOverlay from "./GeoJsonOverlay.svelte";
  import GeoJsonMultiOverlay from "./GeoJsonMultiOverlay.svelte";
  import MapLabel from "./MapLabel.svelte";
  import MapMarkerLabel from "./MapMarkerLabel.svelte";
  import GeoLine from "./GeoLine.svelte";
  import StaticDot from "./StaticDot.svelte";
  import ArcOverlay from "./ArcOverlay.svelte";
  import Arrow from "./Arrow.svelte";
  import GeoArrow from "./GeoArrow.svelte";
  import GlobeGlow from "./GlobeGlowSimple.svelte";

  import { reducedMotion } from "@stores/reducedMotion.svelte";

  const INITIAL_ZOOM = 1.1;
  const INITIAL_ZOOM_DESKTOP = 2;
  const INITIAL_LNG = 134;
  const INITIAL_LAT = -25;
  const DESKTOP_ZOOM_ENABLED = true;
  const DESKTOP_BREAKPOINT = 900;

  const plumpton: LngLatLike = { lng: INITIAL_LNG, lat: INITIAL_LAT };
  const initialView = { ...plumpton, zoom: INITIAL_ZOOM };

  type DotData = {
    id: string;
    lng: number;
    lat: number;
    color?: string;
  } | null;

  type GeoLineData = {
    from: [number, number];
    to: [number, number];
    color?: string;
  } | null;

  type GeoJsonLayer = {
    name: string;
    fill?: string;
    outline?: string;
    outlineWidth?: number;
  };

  type Props = {
    view: typeof initialView;
    dotLocation?: LngLatLike | null;
    geojson?: string | null;
    geojsons?: GeoJsonLayer[];
    geoline?: GeoLineData;
    staticDots?: DotData[];
    panelName?: string | null;
    showArcs?: boolean;
    countries?: string[];
  };

  let {
    view = initialView,
    dotLocation = null,
    geojson = null,
    geojsons = [],
    geoline = null,
    staticDots = [],
    panelName = null,
    showArcs = false,
    countries = [],
  }: Props = $props();

  let mapLoaded = $state(false);

  const lngSpring = new Spring(
    untrack(() => view.lng),
    { stiffness: 0.8, damping: 0.9 },
  );
  const latSpring = new Spring(
    untrack(() => view.lat),
    { stiffness: 0.8, damping: 0.9 },
  );
  const zoomSpring = new Spring(
    untrack(() => view.zoom),
    { stiffness: 0.8, damping: 0.9 },
  );

  let mapReady = $state(false);

  $effect(() => {
    lngSpring.target = view.lng;
    latSpring.target = view.lat;
    zoomSpring.target = view.zoom;
  });

  const smoothCenter = $derived(
    reducedMotion.current
      ? { lng: view.lng, lat: view.lat }
      : { lng: lngSpring.current, lat: latSpring.current },
  );

  const smoothZoom = $derived(
    reducedMotion.current ? view.zoom : zoomSpring.current,
  );

  let map: Map | undefined = $state.raw();

  const center = $derived({ lng: view.lng, lat: view.lat });

  const knownDots = new SvelteMap<string, { color?: string }>();

  $effect(() => {
    for (const dot of staticDots) {
      if (dot && !knownDots.has(dot.id)) {
        knownDots.set(dot.id, { color: dot.color });
      }
    }
  });

  /**
  Country labels dynamic filtering
  */

  $effect(() => {
    const currentCountries = countries ?? [];
    const m = map; // however you access the map instance
    if (!m || !mapLoaded || !m.getLayer("label_country_all")) return;

    if (currentCountries.length === 0) {
      m.setFilter("label_country_all", ["==", ["get", "class"], "none"]);
      // m.setFilter("label_country_all", ["==", ["get", "class"], "country"]);
    } else {
      m.setFilter("label_country_all", [
        "all",
        ["==", ["get", "class"], "country"],
        ["in", ["get", "name_en"], ["literal", currentCountries]],
      ]);
    }
  });
</script>

<div class={{ ready: mapReady, "map-container": true }}>
  <MapLibre
    bind:map
    zoom={smoothZoom}
    center={smoothCenter}
    style={mapStyles}
    scrollZoom={false}
    boxZoom={false}
    dragRotate={false}
    dragPan={false}
    keyboard={false}
    doubleClickZoom={false}
    touchZoomRotate={false}
    touchPitch={false}
    fadeDuration={100}
    attributionControl={false}
    onload={() => {
      // view.zoom sometimes is off by micro decimals like 0.9999998
      // So maybe instead check the panel is null if causing issues
      // null means "initial" in the config
      if (!panelName) {
        map?.jumpTo({
          zoom: DESKTOP_ZOOM_ENABLED
            ? window.innerWidth < DESKTOP_BREAKPOINT
              ? INITIAL_ZOOM
              : INITIAL_ZOOM_DESKTOP
            : INITIAL_ZOOM,
          center: { lng: INITIAL_LNG, lat: INITIAL_LAT },
        });
      }
      setTimeout(() => (mapReady = true), 1);

      // Load an arrow head
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
        <polygon points="20,10 0,0 4,10 0,20" fill="white"/>
      </svg>`;
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = new Image(20, 20);
      img.onload = () => {
        map?.addImage("arrowhead", img, { sdf: true });
        URL.revokeObjectURL(url);
      };
      img.src = url;

      // Set reactive mapLoaded var
      mapLoaded = true;
    }}
  >
    <Projection type="globe" />
    <Sky fog-color={"white"} atmosphere-blend={1.0} />
    <Light anchor="viewport" position={[1, 0, 0]} intensity={0} />

    {#if map}
      <!-- <GeoJsonOverlay {geojson} /> -->
      <PulsingDot {map} {dotLocation} {center} opacity={dotLocation ? 1 : 0} />
      <GeoJsonMultiOverlay {geojsons} beforeId="pulsing-dot" />

      <!-- <GeoLine
      id="globe-geoline"
      from={geoline?.from ?? null}
      to={geoline?.to ?? null}
    /> -->
      <!-- <Arrow
      id="globe-arrow"
      from={geoline?.from ?? null}
      to={geoline?.to ?? null}
    /> -->
      <!-- <GeoArrow
        id="globe-arrow"
        from={geoline?.from ?? null}
        to={geoline?.to ?? null}
      /> -->
      {#each [...knownDots.entries()] as [dotId, dotMeta] (dotId)}
        <StaticDot
          id={dotId}
          dotLocation={staticDots.find((d) => d?.id === dotId) ?? null}
          {center}
          color={dotMeta.color ?? "#f9f9f9"}
        />
      {/each}
      <!-- <MapLabel id="knin-label" lngLat={[16.197, 44.041]} label="Knin" />
    <MapMarkerLabel lngLat={[16.197, 44.041]} label="Knin" visible={true} /> -->

      <ArcOverlay visible={showArcs} />
      <GlobeGlow />
    {/if}
    <AttributionControl compact={false} />
  </MapLibre>
</div>

<style lang="scss">
  .map-container {
    opacity: 0;
    transition: opacity 0.6s ease;

    &.ready {
      opacity: 1;
    }
  }

  :global {
    // MapLibre copyright dark mode
    .maplibregl-ctrl.maplibregl-ctrl-attrib {
      color: rgba(0, 0, 0, 0.75);
      filter: invert(1);
    }
  }
</style>
