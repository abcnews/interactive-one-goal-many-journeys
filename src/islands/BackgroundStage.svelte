<script lang="ts">
  import Map from "../components/Map.svelte";
  import Globe from "../components/Globe.svelte"
</script>

<div class="background-stage u-full">
  <div class="floating">
    <Globe />
  </div>
</div>

<style lang="scss">
  :global {
    main#content {
      position: relative;
    }
  }
  .background-stage {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    margin: 0;
  }
  .floating {
    position: sticky;
    top: 0;
    background-color: orangered;
    height: 100dvh;
    overflow: clip;
  }
</style>
