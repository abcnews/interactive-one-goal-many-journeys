<script lang="ts">
  if (window.location.pathname.includes("newsapp")) {
    document.body.setAttribute("data-newsapp", "");
  }
</script>

<style lang="scss">
  :global {
    body[data-newsapp] {
      overflow: clip;
      isolation: isolate;
    }
  }
</style>
