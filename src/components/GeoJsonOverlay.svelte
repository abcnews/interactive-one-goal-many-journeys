<script lang="ts">
  import { GeoJSONSource, FillLayer, LineLayer } from "svelte-maplibre-gl";
  import { Tween } from "svelte/motion";
  import { sineInOut } from "svelte/easing";

  import plumptonOutline from "../assets/geojson/plumpton.geojson?url";
  import kninOutline from "../assets/geojson/knin.geojson?url";
  import southSudanOutline from "../assets/geojson/southsudan.geojson?url";

  const FADE_DURATION = 600;

  const geojsonMap: Record<string, string> = {
    plumpton: plumptonOutline,
    knin: kninOutline,
    southsudan: southSudanOutline,
  };

  let { geojson = null }: { geojson?: string | null } = $props();

  const geojsonOpacity = new Tween(0, {
    duration: FADE_DURATION,
    easing: sineInOut,
  });
  let lastGeojsonUrl = $state<string | null>(null);
  let geojsonFadeTimeout: ReturnType<typeof setTimeout> | null = null;

  const geojsonUrl = $derived(geojson ? (geojsonMap[geojson] ?? null) : null);

  $effect(() => {
    if (geojsonUrl) {
      if (geojsonFadeTimeout) {
        clearTimeout(geojsonFadeTimeout);
        geojsonFadeTimeout = null;
      }
      lastGeojsonUrl = geojsonUrl;
      geojsonOpacity.target = 1;
    } else {
      geojsonOpacity.target = 0;
      geojsonFadeTimeout = setTimeout(() => {
        lastGeojsonUrl = null;
        geojsonFadeTimeout = null;
      }, FADE_DURATION);
    }
  });
</script>

{#if lastGeojsonUrl}
  <GeoJSONSource id="geojson-source" data={lastGeojsonUrl}>
    <FillLayer
      paint={{
        "fill-color": "#ff6464",
        "fill-opacity": geojsonOpacity.current * 0.4,
      }}
    />
    <LineLayer
      paint={{
        "line-color": "#ff6464",
        "line-width": 1,
        "line-opacity": geojsonOpacity.current,
      }}
    />
  </GeoJSONSource>
{/if}
