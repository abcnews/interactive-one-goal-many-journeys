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
  };

  const FADE_DURATION = 600;

  const geojsonMap: Record<string, string> = {
    plumpton: plumptonOutline,
    knin: kninOutline,
    southsudan: southSudanOutline,
    salala: salalaOutline,
    conakry: conakryOutline,
    westernsydney: westernsydneyOutline,
  };

  let { geojsons = [] }: { geojsons?: GeoJsonLayer[] } = $props();

  let activeLayers = $state<ActiveLayer[]>([]);
  let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

  // Single shared opacity tween for all layers
  const opacity = new Tween(0, { duration: FADE_DURATION, easing: sineInOut });

  $effect(() => {
    // Only depend on geojsons, not activeLayers or opacity
    const incoming = geojsons;

    if (fadeTimeout) {
      clearTimeout(fadeTimeout);
      fadeTimeout = null;
    }

    if (incoming.length > 0) {
      opacity.target = 0;

      fadeTimeout = setTimeout(() => {
        activeLayers = incoming.flatMap((geo) => {
          const url = geojsonMap[geo.name];
          if (!url) return [];
          return [{
            id: geo.name,
            url,
            fill: geo.fill ?? "rgba(0,0,0,0)",
            outline: geo.outline ?? "rgba(0,0,0,0)",
            outlineWidth: geo.outlineWidth ?? 1,
          }];
        });
        opacity.target = 1;
        fadeTimeout = null;
      }, FADE_DURATION);
    } else {
      opacity.target = 0;
      fadeTimeout = setTimeout(() => {
        activeLayers = [];
        fadeTimeout = null;
      }, FADE_DURATION);
    }
  });
</script>

{#each activeLayers as layer}
  <GeoJSONSource id="geojson-multi-source-{layer.id}" data={layer.url}>
    <FillLayer
      paint={{
        "fill-color": layer.fill,
        "fill-opacity": opacity.current,
      }}
    />
    <LineLayer
      paint={{
        "line-color": layer.outline,
        "line-width": layer.outlineWidth,
        "line-opacity": opacity.current,
      }}
    />
  </GeoJSONSource>
{/each}
