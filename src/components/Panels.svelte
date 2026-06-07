<script lang="ts">
  import { onMount } from "svelte";

  const doMount = () => {
    const panels = document.querySelectorAll('[data-key="panel"]');
    panels[0]?.classList.add("is-first");
    panels[panels.length - 1]?.classList.add("is-last");
  };
  onMount(doMount);
</script>

<style lang="scss">
  @use "../styles/breakpoints.scss";

  :global {
    .u-layout > [data-key="panel"] {
      border: 1px solid #333;
      border-radius: 16px;
      margin-block-start: 90vh;
      margin-block-end: 90vh;
      padding: 16px 32px;
      background: hsla(0, 0%, 15%, 0.95);
      color: white;
      line-height: 1.8em;

      // Mobile: 16px gutters on each side
      margin-inline: 8px !important;
      width: calc(100% - 16px);

      strong {
        font-weight: 900;
      }

      // Desktop: re-center
      @include breakpoints.for-size(tablet-portrait-up) {
        margin-inline: auto !important;
        max-width: 600px;
      }

      // Push to right on Desktop
      /* @include breakpoints.for-size(desktop-up) {
        transform: translateX(50%);
        max-width: 45vw;
      } */

      &.is-first {
        margin-block-start: 140vh;
      }

      &.is-last {
        margin-block-end: 115vh;
      }
    }
  }
</style>
