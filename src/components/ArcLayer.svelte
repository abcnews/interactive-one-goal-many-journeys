<script lang="ts">
  import type * as maplibregl from "maplibre-gl";
  import { DeckGLOverlay } from "@svelte-maplibre-gl/deckgl";
  import { ArcLayer, ScatterplotLayer } from "@deck.gl/layers";
  import { GeoJSONSource, CircleLayer } from "svelte-maplibre-gl";

  const arcs = [
    { from: [138.6007, -34.9285], count: 2 }, // Adelaide
    { from: [150.174438, -35.708057], count: 1 }, // Batemans Bay
    { from: [153.02512, -27.46977], count: 2 }, // Brisbane
    { from: [149.128998, -35.282001], count: 1 }, // Canberra
    { from: [144.9631, -37.8136], count: 6 }, // Melbourne
    { from: [151.7817, -32.9283], count: 1 }, // Newcastle
    { from: [115.8605801, -31.9558964], count: 1 }, // Perth
    { from: [151.2093, -33.8688], count: 4 }, // Sydney
    { from: [2.928656, 51.21543], count: 1 }, // Ostend
    { from: [16.19516, 44.03963], count: 1 }, // Knin
    { from: [10.061731, 44.865102], count: 1 }, // Fidenza
    { from: [-2.099075, 57.149651], count: 2 }, // Aberdeen
    { from: [-13.712222, 9.509167], count: 1 }, // Conakry
    { from: [34.87101, 3.7047], count: 1 }, // Kakuma
    { from: [29.673386, -4.893941], count: 1 }, // Kigoma
  ];

  const to = [-123.1124, 49.2767]; // stadium
</script>

<GeoJSONSource
  id="arc-origins"
  data={{
    type: "FeatureCollection",
    features: arcs.map((arc) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: arc.from },
      properties: { count: arc.count },
    })),
  }}
>
  <CircleLayer
    id="arc-origin-dots"
    paint={{
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "count"],
        1,
        3,
        6,
        7,
      ],
      "circle-color": "#64dcb4",
    }}
  />
</GeoJSONSource>

<DeckGLOverlay
  interleaved={true}
  layers={[
    new ArcLayer({
      id: "arcs",
      data: arcs,
      getSourcePosition: (d) => d.from,
      getTargetPosition: (d) => to as any,
      getSourceColor: [0, 255, 140],
      getTargetColor: [0, 180, 255],
      getWidth: (d) => d.count * 1.5,
      getHeight: 0.2,
      greatCircle: true,
    }),
  ]}
/>

<style lang="scss"></style>
