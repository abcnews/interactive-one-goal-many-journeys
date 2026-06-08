<script lang="ts">
  import { GeoJSONSource, SymbolLayer } from "svelte-maplibre-gl";

  let {
    id,
    lngLat,
    label,
    color = "#ffffff",
    size = 14,
    offset = [0, 0],
  }: {
    id: string;
    lngLat: [number, number];
    label: string;
    color?: string;
    size?: number;
    offset?: [number, number];
  } = $props();
</script>

<GeoJSONSource
  {id}
  data={{
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: { type: "Point", coordinates: lngLat },
      properties: { label },
    }],
  }}
>
  <SymbolLayer
    layout={{
      "text-field": ["get", "label"],
      "text-size": size,
      "text-offset": offset,
      "text-anchor": "top",
      "text-font": ["Open Sans Regular"],
      "text-allow-overlap": true,
    }}
    paint={{
      "text-color": color,
      "text-halo-color": "rgba(0,0,0,0.8)",
      "text-halo-width": 1.5,
    }}
  />
</GeoJSONSource>
