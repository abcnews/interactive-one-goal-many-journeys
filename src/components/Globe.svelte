<script lang="ts">
  import type { Map, LngLatLike } from "maplibre-gl";
  import { MapLibre, Projection } from "svelte-maplibre-gl";

  // ABC hosted:
  // https://www.abc.net.au/res/sites/news-projects/map-vector-style-light/style.json
  import darkTest from "../assets/dark_test.json?url";

  const INITIAL_ZOOM = 1;
  const INITIAL_LNG = 150.839167;
  const INITIAL_LAT = -33.753056;

  const plumpton: LngLatLike = { lng: INITIAL_LNG, lat: INITIAL_LAT };
  const initialView = { ...plumpton, zoom: INITIAL_ZOOM };

  let { view = initialView } = $props();

  let map: Map | undefined = $state.raw();

  const center = $derived.by(() => {
    return {
      lng: view.lng,
      lat: view.lat,
    };
  });
</script>

<MapLibre
  bind:map
  zoom={view.zoom}
  {center}
  style={darkTest}
  scrollZoom={false}
  onload={() => {
    // Hack to get correct latitude loading initially
    if (
      view.zoom === INITIAL_ZOOM &&
      view.lng === INITIAL_LNG &&
      view.lat === INITIAL_LAT
    ) {
      map?.jumpTo({
        zoom: view.zoom,
        center: { lng: 150.839167, lat: -33.753056 },
      });
    }
  }}
>
  <Projection type="globe" />
</MapLibre>
