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

  import mapStyles from "../assets/mapStyles/socceroos_dark-mode_v7.json?url";
  import PulsingDot from "./PulsingDot.svelte";
  import GeoJsonOverlay from "./GeoJsonOverlay.svelte";
  import MapLabel from "./MapLabel.svelte";
  import MapMarkerLabel from "./MapMarkerLabel.svelte";
  import GeoLine from "./GeoLine.svelte";
  import StaticDot from "./StaticDot.svelte";
  import ArcOverlay from "./ArcOverlay.svelte";
  import Arrow from "./Arrow.svelte";
  import GeoArrow from "./GeoArrow.svelte";

  import { reducedMotion } from "@stores/reducedMotion.svelte";

  const INITIAL_ZOOM = 1.1;
  const INITIAL_ZOOM_DESKTOP = 2;
  const INITIAL_LNG = 140.839167;
  const INITIAL_LAT = -30.753056;
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

  type Props = {
    view: typeof initialView;
    dotLocation?: LngLatLike | null;
    geojson?: string | null;
    geoline?: GeoLineData;
    staticDots?: DotData[];
    panelName?: string | null;
    showArcs?: boolean;
  };

  let {
    view = initialView,
    dotLocation = null,
    geojson = null,
    geoline = null,
    staticDots = [],
    panelName = null,
    showArcs = false,
  }: Props = $props();

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

  const visibleLabels = ["Australia", "Japan", "Croatia"];
</script>

<div class={{ ready: mapReady, "map-container": true }}>
  <MapLibre
    bind:map
    zoom={zoomSpring.current}
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
    }}
  >
    <Projection type="globe" />
    <Sky fog-color={"white"} atmosphere-blend={1.0} />
    <Light anchor="viewport" position={[1, 0, 0]} intensity={0} />

    {#if map}
      <PulsingDot {map} {dotLocation} {center} />
      <GeoJsonOverlay {geojson} />
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
      <GeoArrow
        id="globe-arrow"
        from={geoline?.from ?? null}
        to={geoline?.to ?? null}
      />
      {#each [...knownDots.entries()] as [dotId, dotMeta] (dotId)}
        <StaticDot
          id={dotId}
          dotLocation={staticDots.find((d) => d?.id === dotId) ?? null}
          {center}
          color={dotMeta.color ?? "#f3bc00"}
        />
      {/each}
      <!-- <MapLabel id="knin-label" lngLat={[16.197, 44.041]} label="Knin" />
    <MapMarkerLabel lngLat={[16.197, 44.041]} label="Knin" visible={true} /> -->

      <ArcOverlay visible={showArcs} />

      <!-- Glyph warmer — forces ▲ to cache immediately -->
      <GeoJSONSource
        data={{
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [0, 0] },
              properties: {},
            },
          ],
        }}
      >
        <SymbolLayer
          paint={{ "text-opacity": 0 }}
          layout={{ "text-field": "▶", "text-allow-overlap": true }}
        />

        <SymbolLayer
          sourceLayer="place"
          filter={visibleLabels.length > 0
            ? ["in", ["get", "name_en"], ["literal", visibleLabels]]
            : ["==", ["get", "class"], "none"]}
          layout={{
            "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
            "text-font": ["Noto Sans Regular"],
            "text-size": 12,
          }}
          paint={{
            "text-color": "#ffffff",
            "text-halo-color": "#000000",
            "text-halo-width": 1,
          }}
        />
      </GeoJSONSource>
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
