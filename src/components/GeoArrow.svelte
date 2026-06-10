<script lang="ts">
  import {
    GeoJSONSource,
    LineLayer,

    SymbolLayer,
  } from "svelte-maplibre-gl";
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

  const fadeOpacity = new Tween(0, {
    duration: FADE_DURATION,
    easing: sineInOut,
  });
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
    features:
      lastFrom && lastTo
        ? [
            {
              type: "Feature" as const,
              geometry: {
                type: "LineString" as const,
                coordinates: [lastFrom, lastTo],
              },
              properties: {},
            },
          ]
        : [],
  });

  const bearing = $derived.by(() => {
    if (!lastFrom || !lastTo) return 0;
    const [lng1, lat1] = lastFrom.map((d) => (d * Math.PI) / 180);
    const [lng2, lat2] = lastTo.map((d) => (d * Math.PI) / 180);
    const dLng = lng2 - lng1;
    const x = Math.sin(dLng) * Math.cos(lat2);
    const y =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (Math.atan2(x, y) * 180) / Math.PI;
  });

  const dotData = $derived({
    type: "FeatureCollection" as const,
    features: lastTo
      ? [
          {
            type: "Feature" as const,
            geometry: { type: "Point" as const, coordinates: lastTo },
            properties: { bearing: bearing - 90 },
          },
        ]
      : [],
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

  <!-- <GeoJSONSource id="{id}-dot" data={dotData}>
    <CircleLayer
      paint={{
        "circle-radius": 5,
        "circle-color": color,
        "circle-opacity": fadeOpacity.current,
        "circle-stroke-width": 0,
      }}
    />
  </GeoJSONSource> -->

  <GeoJSONSource id="{id}-arrowhead" data={dotData}>
    <SymbolLayer
      layout={{
        "text-field": "▶",
        "text-rotate": ["get", "bearing"],
        "text-rotation-alignment": "map",
        "text-allow-overlap": true,
        "text-ignore-placement": true,
        "text-size": 16,
      }}
      paint={{
        "text-color": color,
        "text-opacity": fadeOpacity.current,
      }}
    />
  </GeoJSONSource>
{/if}
