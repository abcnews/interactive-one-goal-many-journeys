<script lang="ts">
  import { GeoJSONSource, CircleLayer } from "svelte-maplibre-gl";
  import { Tween } from "svelte/motion";
  import { sineInOut } from "svelte/easing";
  import { untrack } from "svelte";

  const FADE_DURATION = 600;

  let {
    id = "static-dot",
    dotLocation = null,
    center,
    color = "f9f9f9",
    radius = 4,
  }: {
    id?: string;
    dotLocation?: { lng: number; lat: number } | null;
    center: { lng: number; lat: number };
    color?: string;
    radius?: number;
  } = $props();

  let dotOpacity = new Tween(0, { duration: FADE_DURATION, easing: sineInOut });
  let lastDotLocation = $state<{ lng: number; lat: number } | null>(null);
  let dotFadeTimeout: ReturnType<typeof setTimeout> | null = null;

  const dotGeoJSON = $derived.by(() => {
    if (!lastDotLocation)
      return { type: "FeatureCollection" as const, features: [] };

    const toRad = (d: number) => (d * Math.PI) / 180;
    const dotLat = toRad(lastDotLocation.lat);
    const dotLng = toRad(lastDotLocation.lng);
    const centerLat = toRad(center.lat);
    const centerLng = toRad(center.lng);

    const dotProduct =
      Math.sin(dotLat) * Math.sin(centerLat) +
      Math.cos(dotLat) * Math.cos(centerLat) * Math.cos(dotLng - centerLng);

    return {
      type: "FeatureCollection" as const,
      features:
        dotProduct > 0
          ? [
              {
                type: "Feature" as const,
                geometry: {
                  type: "Point" as const,
                  coordinates: [lastDotLocation.lng, lastDotLocation.lat],
                },
                properties: {},
              },
            ]
          : [],
    };
  });

  $effect(() => {
    if (dotLocation) {
      if (dotFadeTimeout) {
        clearTimeout(dotFadeTimeout);
        dotFadeTimeout = null;
      }

      const isSameLocation =
        lastDotLocation?.lng === dotLocation.lng &&
        lastDotLocation?.lat === dotLocation.lat;

      if (isSameLocation) {
        dotOpacity.target = 1;
        return;
      }

      if (untrack(() => dotOpacity.target) > 0) {
        dotOpacity.target = 0;
        dotFadeTimeout = setTimeout(() => {
          lastDotLocation = dotLocation;
          dotOpacity.target = 1;
          dotFadeTimeout = null;
        }, FADE_DURATION);
      } else {
        lastDotLocation = dotLocation;
        dotOpacity.target = 1;
      }
    } else {
      dotOpacity.target = 0;
      dotFadeTimeout = setTimeout(() => {
        lastDotLocation = null;
        dotFadeTimeout = null;
      }, FADE_DURATION);
    }
  });
</script>

{#if lastDotLocation}
  <GeoJSONSource id="{id}-source" data={dotGeoJSON}>
    <!-- Outer ring -->
    <CircleLayer
      id="{id}-layer-ring"
      paint={{
        "circle-radius": 12,
        "circle-color": "rgba(249, 249, 249, 0.3)",
        "circle-stroke-color": "rgba(249, 249, 249, 0.5)",
        "circle-stroke-width": 0.5,
        "circle-opacity": dotOpacity.current,
        "circle-stroke-opacity": dotOpacity.current,
      }}
    />
    <!-- Inner dot -->
    <CircleLayer
      id="{id}-layer-dot"
      paint={{
        "circle-radius": 4,
        "circle-color": color,
        "circle-opacity": dotOpacity.current,
      }}
    />
  </GeoJSONSource>
{/if}
