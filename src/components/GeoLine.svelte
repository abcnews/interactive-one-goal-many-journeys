<script lang="ts">
  import { GeoJSONSource, LineLayer, CircleLayer } from "svelte-maplibre-gl";

  let {
    id,
    from,
    to,
    color = "#ff6464",
    width = 2,
    opacity = 0.8,
  }: {
    id: string;
    from: [number, number];
    to: [number, number];
    color?: string;
    width?: number;
    opacity?: number;
  } = $props();

  const lineData = $derived({
    type: "FeatureCollection" as const,
    features: [{
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [from, to],
      },
      properties: {},
    }],
  });

  const dotData = $derived({
    type: "FeatureCollection" as const,
    features: [{
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: to,
      },
      properties: {},
    }],
  });
</script>

<GeoJSONSource id="{id}-line" data={lineData}>
  <LineLayer
    paint={{
      "line-color": color,
      "line-width": width,
      "line-opacity": opacity,
    }}
  />
</GeoJSONSource>

<GeoJSONSource id="{id}-dot" data={dotData}>
  <CircleLayer
    paint={{
      "circle-radius": 5,
      "circle-color": color,
      "circle-opacity": 1,
      "circle-stroke-width": 0,
    }}
  />
</GeoJSONSource>
