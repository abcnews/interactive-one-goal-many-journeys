<script lang="ts">
  import Globe from "../components/Globe.svelte";
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
      padding-block: 6em;

      /* > *:not(#stage) {
        position: relative;
      } */
    }
  }
  .background-stage {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    margin-block: 0 !important;
    z-index: -1;
  }
  .floating {
    position: sticky;
    top: 0;
    height: 100dvh;
    overflow: clip;
  }
</style>
