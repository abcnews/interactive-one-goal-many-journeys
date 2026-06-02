<script lang="ts">
  import { onMount } from "svelte";

  const doMount = () => {
    const panels = document.querySelectorAll('[data-key="panel"]');
    panels[0]?.classList.add("is-first");
  };
  onMount(doMount);
</script>

<style lang="scss">
  @use "../styles/breakpoints.scss";

  :global {
    .u-layout > [data-key="panel"] {
      border: 1px solid #333;
      border-radius: 9999px;
      margin-block-start: 90vh;
      margin-block-end: 90vh;
      padding: 32px 48px;
      background: #222;

      // Push to right on Desktop
      /* @include breakpoints.for-size(desktop-up) {
        transform: translateX(50%);
        max-width: 45vw;
      } */

      &.is-first {
        margin-block-start: 80vh;
      }
    }
  }
</style>
