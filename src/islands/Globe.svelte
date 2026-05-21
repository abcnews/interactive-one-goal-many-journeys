<script lang="ts">
  import type { Map, LngLatLike } from "maplibre-gl";
  import { MapLibre, Marker, Projection, Light, Sky } from "svelte-maplibre-gl";

  import openFreeMap from "../assets/open-free-map.json?url";

  let map: Map | undefined = $state.raw();

  const brisbane: LngLatLike = {
    lng: 153.0204415,
    lat: -27.4752564,
  };
</script>

<div class="map u-full sticky-container">
  <div class="sticky-block">
    <MapLibre
      bind:map
      zoom={8}
      center={brisbane}
      style={openFreeMap}
      scrollZoom={false}
    >
      <Projection type="globe" />
      <Marker lnglat={brisbane} />
    </MapLibre>
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
