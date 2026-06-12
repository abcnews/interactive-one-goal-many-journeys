<script lang="ts">
  import type { Map, LngLatLike, StyleImageInterface } from "maplibre-gl";
  import { GeoJSONSource, SymbolLayer } from "svelte-maplibre-gl";
  import { Tween } from "svelte/motion";
  import { sineInOut } from "svelte/easing";
  import { untrack } from "svelte";

  const FADE_DURATION = 600;
  const DOT_SIZE = 80;

  let {
    map,
    dotLocation = null,
    center,
  }: {
    map: Map;
    dotLocation?: any;
    center: { lng: number; lat: number };
  } = $props();

  let dotReady = $state(false);
  let dotOpacity = new Tween(0, { duration: FADE_DURATION, easing: sineInOut });
  let lastDotLocation = $state<{ lng: number; lat: number } | null>(null);
  let dotFadeTimeout: ReturnType<typeof setTimeout> | null = null;

  function createPulsingDot(map: Map): StyleImageInterface {
    return {
      width: DOT_SIZE,
      height: DOT_SIZE,
      data: new Uint8Array(DOT_SIZE * DOT_SIZE * 4),
      context: null as CanvasRenderingContext2D | null,

      onAdd() {
        const canvas = document.createElement("canvas");
        canvas.width = DOT_SIZE;
        canvas.height = DOT_SIZE;
        this.context = canvas.getContext("2d", { willReadFrequently: true });
      },

      render() {
        const duration = 1500;
        const t = (performance.now() % duration) / duration;
        const ctx = this.context!;
        const center = DOT_SIZE / 2;
        const innerRadius = DOT_SIZE * 0.1; // smaller dot (was 0.15)
        const maxRadius = DOT_SIZE * 0.45;
        const radius = innerRadius + (maxRadius - innerRadius) * t;

        ctx.clearRect(0, 0, DOT_SIZE, DOT_SIZE);

        // Pulse ring fill
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 188, 0, ${(1 - t) * 0.4})`;
        ctx.fill();

        // Pulse ring border
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(243, 188, 0, ${1 - t})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(243, 188, 0, 1)";
        ctx.fill();

        // Inner dot border
        // ctx.beginPath();
        // ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
        // ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        // ctx.lineWidth = 1.5;
        // ctx.stroke();

        this.data = ctx.getImageData(0, 0, DOT_SIZE, DOT_SIZE).data;
        map.triggerRepaint();
        return true;
      },
    } as StyleImageInterface & { context: CanvasRenderingContext2D | null };
  }

  // Register image once map is available
  $effect(() => {
    map.addImage("pulsing-dot", createPulsingDot(map), {
      pixelRatio: 2,
    });
    dotReady = true;
  });

  const dotGeoJSON = $derived.by(() => {
    if (!lastDotLocation)
      return { type: "FeatureCollection" as const, features: [] };

    const toRad = (d: number) => (d * Math.PI) / 180;

    const dotLat = toRad(lastDotLocation.lat);
    const dotLng = toRad(lastDotLocation.lng);
    const centerLat = toRad(center.lat);
    const centerLng = toRad(center.lng);

    // Dot product of the two unit vectors on the sphere
    const dotProduct =
      Math.sin(dotLat) * Math.sin(centerLat) +
      Math.cos(dotLat) * Math.cos(centerLat) * Math.cos(dotLng - centerLng);

    // Visible if angular distance < 90° (dot product > 0)
    const isVisible = dotProduct > 0;

    return {
      type: "FeatureCollection" as const,
      features: isVisible
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
        // Same spot — just make sure it's visible
        dotOpacity.target = 1;
        return;
      }

      if (untrack(() => dotOpacity.target) > 0) {
        // Different location, currently visible — fade out first, then move
        dotOpacity.target = 0;
        dotFadeTimeout = setTimeout(() => {
          lastDotLocation = dotLocation;
          dotOpacity.target = 1;
          dotFadeTimeout = null;
        }, FADE_DURATION);
      } else {
        // Not visible — fade in at new position
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

  // $effect(() => {
  //   if (dotLocation) {
  //     if (dotFadeTimeout) {
  //       clearTimeout(dotFadeTimeout);
  //       dotFadeTimeout = null;
  //     }
  //     lastDotLocation = dotLocation;
  //     dotOpacity.target = 1;
  //   } else {
  //     dotOpacity.target = 0;
  //     dotFadeTimeout = setTimeout(() => {
  //       lastDotLocation = null;
  //       dotFadeTimeout = null;
  //     }, FADE_DURATION);
  //   }
  // });
</script>

{#if dotReady}
  <GeoJSONSource id="dot-source" data={dotGeoJSON}>
    <SymbolLayer
      id="dot-layer"
      layout={{ "icon-image": "pulsing-dot", "icon-allow-overlap": true }}
      paint={{ "icon-opacity": dotOpacity.current }}
    />
  </GeoJSONSource>
{/if}
