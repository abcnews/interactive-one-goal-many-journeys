<script lang="ts">
  import { onMount } from "svelte";
  import { watch } from "runed";
  import { reducedMotion } from "@stores/reducedMotion.svelte";

  onMount(() => {
    const panels = document.querySelectorAll<HTMLElement>('[data-key="panel"]');
    panels[0]?.classList.add("is-first");
    panels[panels.length - 1]?.classList.add("is-last");

    Array.from(panels).forEach((panel) => {
      const tag = panel.dataset.tag ?? "";
      if (tag.includes("MARGINreduce")) {
        panel.classList.add("reduced-margin-block-end");
      }
      if (tag.includes("MARGINreducetop")) {
        panel.classList.add("reduced-margin-block-start");
      }
    });
  });

  watch(
    () => reducedMotion.current,
    () => {
      const panels =
        document.querySelectorAll<HTMLElement>('[data-key="panel"]');
      Array.from(panels).forEach((panel) => {
        const tag = panel.dataset.tag ?? "";
        if (tag.includes("PANELhide")) {
          panel.classList.toggle("nodisplay", reducedMotion.current);
          panel.classList.toggle("hidden", !reducedMotion.current);
        }
      });
    },
  );
</script>

<style lang="scss">
  @use "../styles/breakpoints.scss";

  :global {
    .u-layout > [data-key="panel"] {
      position: relative;
      border: 1px solid transparent;
      border-radius: 16px;
      margin-block-start: 90vh;
      margin-block-end: 90vh;
      padding: 0px 18px;
      background: rgba(0, 4, 2, 0.75);
      color: #f9f9f9;
      line-height: 1.8em;

      // Mobile: 16px gutters on each side
      margin-inline: 16px !important;
      width: calc(100% - 32px);

      strong {
        font-weight: 900;
      }

      @include breakpoints.for-size(tablet-portrait-up) {
        // non-mobile: re-center
        margin-inline: auto !important;
        max-width: 600px;

        // Extra padding
        padding: 8px 32px;
      }

      @include breakpoints.for-size(desktop-up) {
        // Push to right on Desktop
        /* transform: translateX(50%);
        max-width: 45vw; */

        font-size: 18px;
      }

      &.is-first {
        margin-block-start: 100vh;
      }

      &.is-last {
        margin-block-end: 60vh;
      }

      &.reduced-margin-block-end {
        margin-block-end: 2em;
      }

      &.reduced-margin-block-start {
        margin-block-start: 2em;
      }

      &.hidden {
        visibility: hidden;
      }

      &.nodisplay {
        height: 0;
        min-height: 0;
        overflow: hidden;
        margin-block-start: 0 !important;
        margin-block-end: 0 !important;
        padding: 0;
        border: none;
        /* Pull adjacent siblings' margins back in */
        margin-block: calc(-45vh) !important;
      }
    }
  }
</style>
