<script lang="ts">
  import type * as maplibregl from "maplibre-gl";
  import { MapLibre, Marker, Projection, Light, Sky } from "svelte-maplibre-gl";
  import { DeckGLOverlay } from "@svelte-maplibre-gl/deckgl";
  import { ArcLayer } from "@deck.gl/layers";

  import openFreeMap from "../assets/open-free-map.json?url";
  import darkMatter from "../assets/dark_matter.json?url";
  import toner from "../assets/toner.json?url";
  import darkTest from "../assets/dark_test.json?url";

  let map: maplibregl.Map | undefined = $state.raw();

  const brisbane: maplibregl.LngLatLike = {
    lng: 153.0204415,
    lat: -27.4752564,
  };


  const arcs = [
    { from: [153.02512, -27.46977], to: [-123.1124, 49.2767] }, // Brisbane
    { from: [153.399994, -28.016666], to: [-123.1124, 49.2767] }, // Gold Coast
    { from: [144.9631, -37.8136], to: [-123.1124, 49.2767] }, // Melbourne
    { from: [138.6007, -34.9285], to: [-123.1124, 49.2767] }, // Adelaide
    { from: [138.74902, -34.60251], to: [-123.1124, 49.2767] }, // Gawler
    { from: [115.8605801, -31.9558964], to: [-123.1124, 49.2767] }, // Perth
    { from: [149.128998, -35.282001], to: [-123.1124, 49.2767] }, // Canberra
    { from: [151.2093, -33.8688], to: [-123.1124, 49.2767] }, // Sydney
    { from: [151.7817, -32.9283], to: [-123.1124, 49.2767] }, // Newcastle
    { from: [150.174438, -35.708057], to: [-123.1124, 49.2767] }, // Batemans Bay
    { from: [150.8542, -34.6738], to: [-123.1124, 49.2767] }, // Kiama
    { from: [-2.099075, 57.149651], to: [-123.1124, 49.2767] }, // Aberdeen
    { from: [-2.9707, 56.462002], to: [-123.1124, 49.2767] }, // Dundee
    { from: [-0.1278, 51.5074], to: [-123.1124, 49.2767] }, // London
    { from: [10.061731, 44.865102], to: [-123.1124, 49.2767] }, // Fidenza
    { from: [15.981894, 45.815119], to: [-123.1124, 49.2767] }, // Zagreb
    { from: [16.19516, 44.03963], to: [-123.1124, 49.2767] }, // Knin
    { from: [2.928656, 51.21543], to: [-123.1124, 49.2767] }, // Ostend
    { from: [29.673386, -4.893941], to: [-123.1124, 49.2767] }, // Kigoma
    { from: [-13.712222, 9.509167], to: [-123.1124, 49.2767] }, // Conakry
  ];

  $effect(() => {
    setTimeout(() => {
      map?.getStyle().layers.forEach((l) => console.log(l.id, l.type));
    }, 500);

    // map?.on("load", () => {
    //   ["label_country_1", "label_country_2"].forEach((id) => {
    //     map?.setLayoutProperty(id, "visibility", "visible");
    //   });
    // });
  });
</script>

<div class="map">
  <MapLibre zoom={3} center={brisbane} class="h-[400px]" style={darkTest} bind:map>
    <Projection type="globe" />

    <DeckGLOverlay
      interleaved={true}
      layers={[
        new ArcLayer({
          id: "arcs",
          data: arcs,
          getSourcePosition: (d) => d.from,
          getTargetPosition: (d) => d.to,
          getSourceColor: [0, 255, 140],
          getTargetColor: [0, 180, 255],
          getWidth: 3,
          getHeight: 0.2, // height above globe surface
          greatCircle: true, // ← follow globe curvature properly
        }),
      ]}
    />

    <!-- <Marker lnglat={[141.692222, 42.775]} /> -->
  </MapLibre>
</div>

<style lang="scss">
  .map {
    :global(.maplibregl-map) {
      height: 100dvh;
    }
  }
</style>
