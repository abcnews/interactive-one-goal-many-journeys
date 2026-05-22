<script lang="ts">
  import Globe from "../components/Globe.svelte";
  import Panels from "../components/Panels.svelte";
</script>

<div class="map u-full sticky-container">
  <div class="sticky-block">
    <Globe />
  </div>
  <Panels />
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
