<script lang="ts">
  import type { Map, LngLatLike } from "maplibre-gl";
  import { MapLibre, Projection, Sky, Light } from "svelte-maplibre-gl";

  let skyEnabled = $state(true);
  let skyColor = $state("#001560");
  let horizonColor = $state("#0090c0");
  let fogColor = $state("#ffffff");
  let skyHorizonBlend = $state(1);
  let horizonFogBlend = $state(1);
  let fogGroundBlend = $state(1);

  // ABC hosted:
  // https://www.abc.net.au/res/sites/news-projects/map-vector-style-light/style.json
  // import darkTest from "../assets/dark_test.json?url";
  import mapStyles from "../assets/mapStyles/socceroos_dark-mode_v7.json?url";

  const INITIAL_ZOOM = 1;
  const INITIAL_LNG = 150.839167;
  const INITIAL_LAT = -33.753056;

  const plumpton: LngLatLike = { lng: INITIAL_LNG, lat: INITIAL_LAT };
  const initialView = { ...plumpton, zoom: INITIAL_ZOOM };

  let { view = initialView } = $props();

  let map: Map | undefined = $state.raw();

  const center = $derived.by(() => {
    return {
      lng: view.lng,
      lat: view.lat,
    };
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
        center: { lng: 150.839167, lat: -33.753056 },
      });
    }
  }}
>
  <Projection type="globe" />
  <Sky
    sky-color={skyColor}
    horizon-color={horizonColor}
    fog-color={fogColor}
    sky-horizon-blend={skyHorizonBlend}
    horizon-fog-blend={horizonFogBlend}
    fog-ground-blend={fogGroundBlend}
    atmosphere-blend={0.7}

  />
  <Light anchor="viewport" position={[1, 0, 0]} intensity={0} />
</MapLibre>
