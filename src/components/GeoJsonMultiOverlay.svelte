<script lang="ts">
  import { GeoJSONSource, FillLayer, LineLayer } from "svelte-maplibre-gl";
  import { Tween } from "svelte/motion";
  import { sineInOut } from "svelte/easing";

  import plumptonOutline from "../assets/geojson/plumpton.geojson?url";
  import kninOutline from "../assets/geojson/knin.geojson?url";
  import southSudanOutline from "../assets/geojson/southsudan.geojson?url";
  import salalaOutline from "../assets/geojson/salala.geojson?url";
  import conakryOutline from "../assets/geojson/conakry.geojson?url";
  import westernsydneyOutline from "../assets/geojson/westernsydney.geojson?url";
  import liberiaOutline from "../assets/geojson/liberia-outline_EPSG4326.geojson?url";
  import serbiaOutline from "../assets/geojson/serbia-outline.geojson?url";
  import unitedKingdomOutline from "../assets/geojson/uk-outline.geojson?url";
  import guineaOutline from "../assets/geojson/guinea-outline.geojson?url";

  type GeoJsonLayer = {
    name: string;
    fill?: string;
    outline?: string;
    outlineWidth?: number;
  };

  type ActiveLayer = {
    id: string;
    url: string;
    fill: string;
    outline: string;
    outlineWidth: number;
    opacity: Tween<number>;
  };

  const FADE_DURATION = 600;

  const geojsonMap: Record<string, string> = {
    plumpton: plumptonOutline,
    knin: kninOutline,
    southsudan: southSudanOutline,
    salala: salalaOutline,
    conakry: conakryOutline,
    westernsydney: westernsydneyOutline,
    liberia: liberiaOutline,
    serbia: serbiaOutline,
    unitedkingdom: unitedKingdomOutline,
    guinea: guineaOutline,
  };

  let { geojsons = [] }: { geojsons?: GeoJsonLayer[] } = $props();

  // Track each layer's opacity individually so they can fade independently
  let activeLayers = $state<ActiveLayer[]>([]);
  let cleanupTimeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    const incomingNames = new Set(geojsons.map((g) => g.name));
    const activeNames = new Set(activeLayers.map((l) => l.id));

    // Cancel any pending cleanup — incoming may have changed before it fired
    if (cleanupTimeout) {
      clearTimeout(cleanupTimeout);
      cleanupTimeout = null;
    }

    // Fade out layers that are no longer in incoming
    for (const layer of activeLayers) {
      if (!incomingNames.has(layer.id)) {
        layer.opacity.target = 0;
      } else {
        // Make sure layers that should be visible are faded back in
        layer.opacity.target = 1;
      }
    }

    // Add layers that are new
    for (const geo of geojsons) {
      if (!activeNames.has(geo.name)) {
        const url = geojsonMap[geo.name];
        if (!url) continue;
        const opacity = new Tween(0, {
          duration: FADE_DURATION,
          easing: sineInOut,
        });
        activeLayers = [
          ...activeLayers,
          {
            id: geo.name,
            url,
            fill: geo.fill ?? "rgba(0,0,0,0)",
            outline: geo.outline ?? "rgba(0,0,0,0)",
            outlineWidth: geo.outlineWidth ?? 2,
            opacity,
          },
        ];
        opacity.target = 1;
      }
    }

    // Schedule cleanup — but only after fade is complete
    cleanupTimeout = setTimeout(() => {
      activeLayers = activeLayers.filter((l) => incomingNames.has(l.id));
      cleanupTimeout = null;
    }, FADE_DURATION);
  });
</script>

{#each activeLayers as layer (layer.id)}
  <GeoJSONSource id="geojson-multi-source-{layer.id}" data={layer.url}>
    <FillLayer
      beforeId="label_country_2"
      paint={{
        "fill-color": layer.fill,
        "fill-opacity": layer.opacity.current,
      }}
    />
    <LineLayer
      beforeId="label_country_2"
      paint={{
        "line-color": layer.outline,
        "line-width": layer.outlineWidth,
        "line-opacity": layer.opacity.current,
      }}
    />
  </GeoJSONSource>
{/each}
