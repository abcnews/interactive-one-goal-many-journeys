<script lang="ts">
  import { reducedMotion } from "@stores/reducedMotion.svelte";
  import Utils from "./components/Utils.svelte";
  import BackgroundStage from "./components/BackgroundStage.svelte";
  import LandingCollage from "./components/LandingCollage/LandingCollage.svelte";
  import Panels from "./components/Panels.svelte";

  // Start reactive observation of reduced motion toggle setting
  $effect(() => reducedMotion.observe());
</script>

<BackgroundStage />
<LandingCollage />
<Panels />
<Utils />

<style lang="scss">
  :global(.maplibregl-map) {
    height: 100dvh;
  }
</style>
