<script lang="ts">
  if (window.location.pathname.includes("newsapp")) {
    document.body.setAttribute("data-newsapp", "");
  }
</script>

<style lang="scss">
  :global {
    body {
      overflow-x: clip !important;
    }
    body[data-newsapp] {
      overflow: clip;
      isolation: isolate;
    }
  }
</style>
