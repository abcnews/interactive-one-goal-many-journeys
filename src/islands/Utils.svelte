<script lang="ts">
  /** Detects ABC News app */
  let isNewsApp = $state(false);

  $effect(() => {
    const url = new URL(window.location.href);
    isNewsApp = url.pathname.includes("newsapp");
  });
</script>

<svelte:head>
  {#if isNewsApp}
    <style>
      body {
        overflow: clip !important;
      }
    </style>
  {/if}
</svelte:head>
