<!-- Probably use MapLabel.svelte instead for now -->

<script lang="ts">
  import { Marker } from "svelte-maplibre-gl";
  import { blur } from "svelte/transition";

  let {
    lngLat,
    label,
    visible = true,
  }: {
    lngLat: [number, number];
    label: string;
    visible?: boolean;
  } = $props();
</script>

{#if visible}
  <Marker lnglat={lngLat} anchor="bottom">
    {#snippet content()}
      <div class="marker-label" transition:blur>
        {label}
      </div>
    {/snippet}
  </Marker>
{/if}

<style>
  :global(.marker-label) {
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
    white-space: nowrap;
    pointer-events: none;
  }
</style>
