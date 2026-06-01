<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { ScrollState, ElementSize, watch } from "runed";

  import { reducedMotion } from "@stores/reducedMotion.svelte";

  import Utils from "./components/Utils.svelte";
  import BackgroundStage from "./components/BackgroundStage.svelte";
  import LandingCollage from "./components/LandingCollage/LandingCollage.svelte";
  import Panels from "./components/Panels.svelte";

  let windowInnerHeight = $state(600);
  const bodySize = new ElementSize(() => document.body);
  const scroll = new ScrollState({
    element: () => window,
  });

  let panelStates = $derived.by(() => {
    if (!bodySize.height) return []; // For reactivity mostly

    const panels = document.querySelectorAll(
      '[data-key^="panel"]',
    ) as NodeListOf<HTMLElement>;

    return Array.from(panels).map((panel) => ({
      name: panel.dataset.tag,
      top: panel.getBoundingClientRect().top + untrack(() => scroll.y),
    }));
  });

  const currentPanel = $derived(
    panelStates.findLast((panel) => scroll.y + windowInnerHeight > panel.top) ??
      null,
  );

  $inspect(currentPanel);

  // Start reactive observation of reduced motion toggle setting
  onMount(() => reducedMotion.observe());
</script>

<BackgroundStage />
<LandingCollage />
<Panels />
<Utils />

<svelte:window bind:innerHeight={windowInnerHeight} />

<style lang="scss">
  :global(.maplibregl-map) {
    height: 100dvh;
  }
</style>
