<script lang="ts">
  import { GeoJSONSource, LineLayer, CircleLayer } from "svelte-maplibre-gl";
  import { Tween } from "svelte/motion";
  import { sineInOut } from "svelte/easing";

  const FADE_DURATION = 600;

  type Props = {
    id?: string;
    from?: [number, number] | null;
    to?: [number, number] | null;
    color?: string;
    width?: number;
  };

  let {
    id = "geoline",
    from = null,
    to = null,
    color = "rgba(243, 188, 0, 1)",
    width = 2,
  }: Props = $props();

  const fadeOpacity = new Tween(0, { duration: FADE_DURATION, easing: sineInOut });
  let lastFrom = $state<[number, number] | null>(null);
  let lastTo = $state<[number, number] | null>(null);
  let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (from && to) {
      if (fadeTimeout) {
        clearTimeout(fadeTimeout);
        fadeTimeout = null;
      }
      lastFrom = from;
      lastTo = to;
      fadeOpacity.target = 1;
    } else {
      fadeOpacity.target = 0;
      fadeTimeout = setTimeout(() => {
        lastFrom = null;
        lastTo = null;
        fadeTimeout = null;
      }, FADE_DURATION);
    }
  });

  const lineData = $derived({
    type: "FeatureCollection" as const,
    features: lastFrom && lastTo ? [{
      type: "Feature" as const,
      geometry: { type: "LineString" as const, coordinates: [lastFrom, lastTo] },
      properties: {},
    }] : [],
  });

  const dotData = $derived({
    type: "FeatureCollection" as const,
    features: lastTo ? [{
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: lastTo },
      properties: {},
    }] : [],
  });
</script>

{#if lastFrom && lastTo}
  <GeoJSONSource id="{id}-line" data={lineData}>
    <LineLayer
      paint={{
        "line-color": color,
        "line-width": width,
        "line-opacity": fadeOpacity.current,
      }}
    />
  </GeoJSONSource>

  <GeoJSONSource id="{id}-dot" data={dotData}>
    <CircleLayer
      paint={{
        "circle-radius": 5,
        "circle-color": color,
        "circle-opacity": fadeOpacity.current,
        "circle-stroke-width": 0,
      }}
    />
  </GeoJSONSource>
{/if}
