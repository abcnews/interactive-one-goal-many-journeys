<script lang="ts">
  import { SvelteMap } from "svelte/reactivity";
  import type { Map, LngLatLike } from "maplibre-gl";
  import {
    MapLibre,
    Projection,
    Sky,
    Light,
    AttributionControl,
  } from "svelte-maplibre-gl";

  import mapStyles from "../assets/mapStyles/socceroos_dark-mode_v7.json?url";
  import PulsingDot from "./PulsingDot.svelte";
  import GeoJsonOverlay from "./GeoJsonOverlay.svelte";
  import MapLabel from "./MapLabel.svelte";
  import MapMarkerLabel from "./MapMarkerLabel.svelte";
  import GeoLine from "./GeoLine.svelte";
  import StaticDot from "./StaticDot.svelte";
  import ArcOverlay from "./ArcOverlay.svelte";

  const INITIAL_ZOOM = 1;
  const INITIAL_LNG = 134.354806;
  const INITIAL_LAT = -25.610111;

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
</script>

<MapLibre
  bind:map
  zoom={view.zoom}
  {center}
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
    if (
      // view.zoom === INITIAL_ZOOM &&
      // view.lng === INITIAL_LNG &&
      // view.lat === INITIAL_LAT
      !panelName
    ) {
      map?.jumpTo({
        zoom: INITIAL_ZOOM,
        center: { lng: INITIAL_LNG, lat: INITIAL_LAT },
      });
    }
  }}
>
  <Projection type="globe" />
  <Sky fog-color={"white"} atmosphere-blend={1.0} />
  <Light anchor="viewport" position={[1, 0, 0]} intensity={0} />

  {#if map}
    <PulsingDot {map} {dotLocation} {center} />
    <GeoJsonOverlay {geojson} />
    <GeoLine
      id="globe-geoline"
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
  {/if}
  <AttributionControl compact={false} />
</MapLibre>

<style lang="scss">
  :global {
    // MapLibre copyright dark mode
    .maplibregl-ctrl.maplibregl-ctrl-attrib {
      color: rgba(0, 0, 0, 0.75);
      filter: invert(1);
    }
  }
</style>
