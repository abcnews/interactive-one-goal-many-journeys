<script lang="ts">
  import type { Map, LngLatLike } from "maplibre-gl";
  import { MapLibre, Projection, Sky, Light } from "svelte-maplibre-gl";

  import mapStyles from "../assets/mapStyles/socceroos_dark-mode_v7.json?url";
  import PulsingDot from "./PulsingDot.svelte";
  import GeoJsonOverlay from "./GeoJsonOverlay.svelte";
  import MapLabel from "./MapLabel.svelte";
  import MapMarkerLabel from "./MapMarkerLabel.svelte";
  import GeoLine from "./GeoLine.svelte";

  const INITIAL_ZOOM = 1;
  const INITIAL_LNG = 134.354806;
  const INITIAL_LAT = -25.610111;

  const plumpton: LngLatLike = { lng: INITIAL_LNG, lat: INITIAL_LAT };
  const initialView = { ...plumpton, zoom: INITIAL_ZOOM };

  let {
    view = initialView,
    dotLocation = null,
    geojson = null,
  } = $props<{
    view: typeof initialView;
    dotLocation?: LngLatLike | null;
    geojson?: string | null;
  }>();

  let map: Map | undefined = $state.raw();

  const center = $derived({ lng: view.lng, lat: view.lat });
</script>

<MapLibre
  bind:map
  zoom={view.zoom}
  {center}
  style={mapStyles}
  scrollZoom={false}
  fadeDuration={100}
  onload={() => {
    if (
      view.zoom === INITIAL_ZOOM &&
      view.lng === INITIAL_LNG &&
      view.lat === INITIAL_LAT
    ) {
      map?.jumpTo({
        zoom: view.zoom,
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
    <!-- <GeoLine
      id="knin-to-belgrade"
      from={[16.197, 44.041]}
      to={[20.457, 44.787]}
      color="#f3bc00"
    /> -->
    <!-- <MapLabel id="knin-label" lngLat={[16.197, 44.041]} label="Knin" />
    <MapMarkerLabel lngLat={[16.197, 44.041]} label="Knin" visible={true} /> -->
  {/if}
</MapLibre>
