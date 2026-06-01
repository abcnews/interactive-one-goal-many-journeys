<script lang="ts">
  const panels = document.querySelectorAll('[data-key="panel"]');
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

      @include breakpoints.for-size(desktop-up) {
        transform: translateX(50%);
        max-width: 45vw;
      }
    }
  }
</style>
