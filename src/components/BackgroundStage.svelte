<script lang="ts">
  import Globe from "../components/Globe.svelte";
</script>

<div class="background-stage u-full">
  <div class="floating">
    <!-- <Globe /> -->
  </div>
</div>

<style lang="scss">
  :global {
    main#content {
      position: relative;
      padding-block: 1em 1em;
    }
  }
  .background-stage {
    position: absolute;
    inset: 0;
    background: hsl(0, 0%, 5.9%);
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
