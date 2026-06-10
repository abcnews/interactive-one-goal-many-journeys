<script lang="ts">
  import { Marker } from "svelte-maplibre-gl";
  import { Tween } from "svelte/motion";
  import { sineInOut } from "svelte/easing";

  const FADE_DURATION = 600;

  type Props = {
    id?: string;
    from?: [number, number] | null;
    to?: [number, number] | null;
  };

  let { id = "arrow", from = null, to = null }: Props = $props();

  const fadeOpacity = new Tween(0, {
    duration: FADE_DURATION,
    easing: sineInOut,
  });
  let lastFrom = $state<[number, number] | null>(null);
  let lastTo = $state<[number, number] | null>(null);
  let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (from && to) {
      if (fadeTimeout) {
        clearTimeout(fadeTimeout);
        fadeTimeout = null;
      }
      lastFrom = from;
      lastTo = to;
      fadeOpacity.target = 1;
    } else {
      fadeOpacity.target = 0;
      fadeTimeout = setTimeout(() => {
        lastFrom = null;
        lastTo = null;
        fadeTimeout = null;
      }, FADE_DURATION);
    }
  });

  // Calculate bearing (rotation angle) from [lng, lat] to [lng, lat]
  const bearing = $derived.by(() => {
    if (!lastFrom || !lastTo) return 0;
    const [lng1, lat1] = lastFrom.map((d) => (d * Math.PI) / 180);
    const [lng2, lat2] = lastTo.map((d) => (d * Math.PI) / 180);
    const dLng = lng2 - lng1;
    const x = Math.sin(dLng) * Math.cos(lat2);
    const y =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (Math.atan2(x, y) * 180) / Math.PI;
  });

  // Place the marker at the midpoint between from and to
  const midpoint = $derived.by((): [number, number] | null => {
    if (!lastFrom || !lastTo) return null;
    return [(lastFrom[0] + lastTo[0]) / 2, (lastFrom[1] + lastTo[1]) / 2];
  });
</script>

{#if midpoint}
  <Marker lnglat={midpoint} anchor="center">
    {#snippet content()}
      <div
        style:transform="rotate({bearing - 90}deg)"
        style:opacity={fadeOpacity.current}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Arrow pointing right -->
          <line
            x1="4"
            y1="20"
            x2="32"
            y2="20"
            stroke="#F3BC00"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <polyline
            points="24,12 32,20 24,28"
            stroke="#F3BC00"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
      </div>
    {/snippet}
  </Marker>
{/if}
