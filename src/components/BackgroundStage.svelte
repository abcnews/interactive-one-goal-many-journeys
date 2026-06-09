<script lang="ts">
  import { pageState } from "@stores/pageState.svelte";

  let { children = null } = $props();

  const TOP_OFFSET = 300;

  const containerHeight = $derived.by(() => {
    if (!pageState.bodySize.height) return null;

    const headerContent = document.querySelector(".Header-content");
    if (!headerContent) return null;
    const headerDownpage =
      headerContent.getBoundingClientRect().top + pageState.scrollY;

    return headerDownpage;
  });
</script>

<div
  class="background-stage u-full"
  style:max-height={containerHeight
    ? `${containerHeight - TOP_OFFSET}px`
    : "unset"}
>
  <div class="floating">
    {@render children?.()}
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
    /* z-index: -1; */
    /* isolation: isolate; */
  }
  .floating {
    position: sticky;
    top: 0;
    height: 100dvh;
    overflow: clip;
  }
</style>
