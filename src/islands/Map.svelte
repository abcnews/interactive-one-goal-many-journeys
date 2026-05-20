<script lang="ts">
  import type * as maplibregl from "maplibre-gl";
  import { MapLibre, Marker, Projection, Light, Sky } from "svelte-maplibre-gl";
  import { DeckGLOverlay } from "@svelte-maplibre-gl/deckgl";
  import { ArcLayer } from "@deck.gl/layers";

  import openFreeMap from "../assets/open-free-map.json?url";

  let map: maplibregl.Map | undefined = $state.raw();

  const brisbane: maplibregl.LngLatLike = {
    lng: 153.0204415,
    lat: -27.4752564,
  };

  // Simple city-to-city data
  const arcs = [
    { from: [153.02, -27.47], to: [144.96, -37.81] }, // Brisbane → Melbourne
    { from: [153.02, -27.47], to: [151.2, -33.86] }, // Brisbane → Sydney
    { from: [153.02, -27.47], to: [115.86, -31.95] }, // Brisbane → Perth
  ];

  $effect(() => {
    setTimeout(() => {
      map?.getStyle().layers.forEach((l) => console.log(l.id, l.type));
    }, 500);

    map?.on("load", () => {
      ["label_country_1", "label_country_2"].forEach((id) => {
        map?.setLayoutProperty(id, "visibility", "visible");
      });
    });
  });
</script>

<div class="map">
  <MapLibre
    zoom={8}
    center={brisbane}
    class="h-[400px]"
    style={openFreeMap}
    bind:map
  >
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
          getHeight: 0.5, // ← height above globe surface; try 0.3–1.0
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
