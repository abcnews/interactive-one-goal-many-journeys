<script lang="ts">
  import { DeckGLOverlay } from "@svelte-maplibre-gl/deckgl";
  import { ArcLayer } from "@deck.gl/layers";
  import { GeoJSONSource, CircleLayer } from "svelte-maplibre-gl";
  import { scaleSqrt } from "d3-scale";

  const widthScale = scaleSqrt().domain([1, 6]).range([1.5, 4]);

  const { visible = true } = $props();

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

  const to = [-123.111944, 49.276667]; // stadium

  const arcsPlusStadium = [...arcs, { from: to, count: 3 }];

  import { MapboxOverlay } from "@deck.gl/mapbox";
  import { getMapContext } from "svelte-maplibre-gl";

  const { map } = getMapContext();

  $effect(() => {
    if (!map) return;

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: [
        new ArcLayer({
          id: "arcs",
          data: arcs,
          getSourcePosition: (d) => d.from,
          getTargetPosition: (d) => to as any,
          getSourceColor: [243, 188, 0],
          getTargetColor: [243, 188, 0],
          getWidth: (d) => widthScale(d.count),
          getHeight: 0.2,
          greatCircle: true,
          opacity: visible ? 0.8 : 0.0,
        }),
      ],
    });

    map.addControl(overlay);

    return () => {
      map?.removeControl(overlay);
    };
  });
</script>

{#if visible}
  <GeoJSONSource
    id="arc-origins"
    data={{
      type: "FeatureCollection",
      features: arcsPlusStadium.map((arc) => ({
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
          ["exponential", 0.5],
          ["get", "count"],
          1,
          3,
          6,
          5,
        ],
        "circle-color": "#F3BC00",
      }}
    />
  </GeoJSONSource>
{/if}

<!-- <DeckGLOverlay
  interleaved={false}
  layers={[
    new ArcLayer({
      id: "arcs",
      data: arcs,
      getSourcePosition: (d) => d.from,
      getTargetPosition: (d) => to as any,
      getSourceColor: [243, 188, 0],
      getTargetColor: [243, 188, 0],
      getWidth: (d) => widthScale(d.count),
      getHeight: 0.2,
      // greatCircle: true,
      opacity: visible ? 0.8 : 0.1,
    }),
  ]}
/> -->

<style lang="scss"></style>
