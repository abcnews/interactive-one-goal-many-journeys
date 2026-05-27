<script lang="ts">
  import Utils from "./islands/Utils.svelte";
  import BackgroundStage from "./islands/BackgroundStage.svelte";


  $effect(() => {
    console.log("App.svelte mounted...");
  });
</script>

<BackgroundStage />
<Utils />

<style lang="scss">
  :global(.maplibregl-map) {
    height: 100dvh;
  }
</style>
