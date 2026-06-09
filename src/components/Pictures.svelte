<script lang="ts">
  // const pictures = document.querySelectorAll('[data-component="Figure"]');
</script>

<style lang="scss">
  :global {
    [data-component="Figure"] {
      transform: unset !important;
      max-width: 500px !important;
    }

    [data-component="Figure"] [data-component="AspectRatioContainer"] img {
      border-radius: 16px;
    }
  }
</style>
