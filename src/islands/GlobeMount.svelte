<script lang="ts">
  import type { Map, LngLatLike } from "maplibre-gl";
  import { MapLibre, Projection } from "svelte-maplibre-gl";

  // ABC hosted:
  // https://www.abc.net.au/res/sites/news-projects/map-vector-style-light/style.json
  import darkTest from "../assets/dark_test.json?url";

  import Globe from "../components/Globe.svelte";

  let {} = $props();

  let map: Map | undefined = $state.raw();

  const brisbane: LngLatLike = {
    lng: 153.0204415,
    lat: -27.4752564,
  };

  const plumpton: LngLatLike = { lng: 150.839167, lat: -33.753056 };
</script>

<div class="map u-full sticky-container">
  <div class="sticky-block">
    <Globe />
  </div>
</div>

<style lang="scss">
  :global {
    #globe[data-mount="true"] {
      padding-inline: 0;
    }
  }

  .map {
    :global(.maplibregl-map) {
      height: 100dvh;
    }
  }

  .u-full {
    margin-block-end: 0;
  }

  .sticky-container {
    min-height: 200dvh;
  }

  .sticky-block {
    position: sticky;
    top: 0;
  }
</style>
