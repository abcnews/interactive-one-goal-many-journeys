<script lang="ts">
  import type { Map, LngLatLike } from "maplibre-gl";
  import { MapLibre, Projection } from "svelte-maplibre-gl";

  // ABC hosted:
  // https://www.abc.net.au/res/sites/news-projects/map-vector-style-light/style.json
  import darkTest from "../assets/dark_test.json?url";

  let {} = $props();

  let map: Map | undefined = $state.raw();

  const plumpton: LngLatLike = { lng: 150.839167, lat: -33.753056 };
</script>

<MapLibre
  bind:map
  zoom={0}
  center={plumpton}
  style={darkTest}
  scrollZoom={false}
>
  <Projection type="globe" />
</MapLibre>
