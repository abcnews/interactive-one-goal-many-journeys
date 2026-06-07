<script lang="ts">
  import type { Map, LngLatLike, StyleImageInterface } from "maplibre-gl";
  import {
    MapLibre,
    Projection,
    Sky,
    Light,
    GeoJSONSource,
    SymbolLayer,
    FillLayer,
    LineLayer,
  } from "svelte-maplibre-gl";
  import { Tween } from "svelte/motion";
  import { sineInOut } from "svelte/easing";

  import ArcLayer from "./ArcLayer.svelte";

  const FADE_DURATION = 600;

  let dotReady = $state(false);
  let dotOpacity = new Tween(0, { duration: FADE_DURATION, easing: sineInOut });
  let lastDotLocation = $state<{ lng: number; lat: number } | null>(null);

  const geojsonOpacity = new Tween(0, {
    duration: FADE_DURATION,
    easing: sineInOut,
  });
  let lastGeojsonUrl = $state<string | null>(null);

  // ABC hosted:
  // https://www.abc.net.au/res/sites/news-projects/map-vector-style-light/style.json
  // import darkTest from "../assets/dark_test.json?url";
  import mapStyles from "../assets/mapStyles/socceroos_dark-mode_v7.json?url";

  import plumptonOutline from "../assets/geojson/plumpton.geojson?url";
  import kninOutline from "../assets/geojson/knin.geojson?url";

  const INITIAL_ZOOM = 1;
  const INITIAL_LNG = 134.354806;
  const INITIAL_LAT = -25.610111;

  const plumpton: LngLatLike = { lng: INITIAL_LNG, lat: INITIAL_LAT };
  const initialView = { ...plumpton, zoom: INITIAL_ZOOM };

  let {
    view = initialView,
    dotLocation = null,
    geojson = null,
  } = $props<{
    view: typeof initialView;
    dotLocation?: LngLatLike | null;
    geojson?: string | null;
  }>();

  let map: Map | undefined = $state.raw();

  const center = $derived.by(() => {
    return {
      lng: view.lng,
      lat: view.lat,
    };
  });

  const DOT_SIZE = 70;

  const geojsonMap: Record<string, string> = {
    plumpton: plumptonOutline,
    knin: kninOutline,
  };

  const geojsonUrl = $derived(geojson ? (geojsonMap[geojson] ?? null) : null);

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
        const innerRadius = DOT_SIZE * 0.15;
        const maxRadius = DOT_SIZE * 0.45;
        const radius = innerRadius + (maxRadius - innerRadius) * t;

        ctx.clearRect(0, 0, DOT_SIZE, DOT_SIZE);

        // Pulsing ring
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 188, 0, ${1 - t})`;
        ctx.fill();

        // Solid inner dot
        ctx.beginPath();
        ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(243, 188, 0, 1)";
        ctx.fill();

        this.data = ctx.getImageData(0, 0, DOT_SIZE, DOT_SIZE).data;
        map.triggerRepaint();
        return true;
      },
    } as StyleImageInterface & { context: CanvasRenderingContext2D | null };
  }

  const dotGeoJSON = $derived({
    type: "FeatureCollection" as const,
    features: lastDotLocation
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
  });

  $effect(() => {
    if (dotLocation) {
      lastDotLocation = dotLocation; // update position while visible
      dotOpacity.target = 1;
    } else {
      dotOpacity.target = 0;
      // Clear lastDotLocation only after fade completes
      setTimeout(() => {
        lastDotLocation = null;
      }, FADE_DURATION); // match tween duration
    }
  });

  $effect(() => {
    if (geojsonUrl) {
      lastGeojsonUrl = geojsonUrl;
      geojsonOpacity.target = 1;
    } else {
      geojsonOpacity.target = 0;
      setTimeout(() => {
        lastGeojsonUrl = null;
      }, 600);
    }
  });
</script>

<MapLibre
  bind:map
  zoom={view.zoom}
  {center}
  style={mapStyles}
  scrollZoom={false}
  onload={() => {
    // Hack to get correct latitude loading initially
    if (
      view.zoom === INITIAL_ZOOM &&
      view.lng === INITIAL_LNG &&
      view.lat === INITIAL_LAT
    ) {
      map?.jumpTo({
        zoom: view.zoom,
        center: { lng: INITIAL_LNG, lat: INITIAL_LAT },
      });
    }

    if (map) {
      map.addImage("pulsing-dot", createPulsingDot(map), { pixelRatio: 2 });
      dotReady = true;
    }
  }}
>
  <Projection type="globe" />
  <Sky fog-color={"white"} atmosphere-blend={1.0} />
  <Light anchor="viewport" position={[1, 0, 0]} intensity={0} />

  {#if dotReady}
    <GeoJSONSource id="dot-source" data={dotGeoJSON}>
      <SymbolLayer
        id="dot-layer"
        layout={{ "icon-image": "pulsing-dot", "icon-allow-overlap": true }}
        paint={{ "icon-opacity": dotOpacity.current }}
      />
    </GeoJSONSource>
  {/if}

  {#if lastGeojsonUrl}
    <GeoJSONSource id="geojson-source" data={lastGeojsonUrl}>
      <FillLayer
        paint={{
          "fill-color": "#ff6464",
          "fill-opacity": geojsonOpacity.current * 0.4,
        }}
      />
      <LineLayer
        paint={{
          "line-color": "#ff6464",
          "line-width": 1,
          "line-opacity": geojsonOpacity.current,
        }}
      />
    </GeoJSONSource>
  {/if}

  <!-- <ArcLayer /> -->
</MapLibre>
