<script lang="ts">
  // const pictures = document.querySelectorAll('[data-component="Figure"]');
</script>

<style lang="scss">
  :global {
    [data-component="Figure"] {
      transform: unset !important;
      max-width: 360px !important;

      figcaption {
        color: white;
        display: none;
      }
    }

    [data-component="Figure"] [data-component="AspectRatioContainer"] img {
      border-radius: 16px;
    }
  }
</style>
