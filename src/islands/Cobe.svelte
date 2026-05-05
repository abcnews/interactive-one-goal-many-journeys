<script lang="ts">
  import createGlobe from "cobe";
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement;
  let phi = 0;

  onMount(() => {
    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.2,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [0.2, 0.4, 1],
      glowColor: [1, 1, 1],
      markers: [
        { location: [-33.8558549, 151.1140441], size: 0.03, id: "Sydney" },
        { location: [49.2577062,-123.2063036,], size: 0.03, id: "Vancouver" },
      ],
      arcs: [{ from: [-33.8558549, 151.1140441], to: [49.2577062,-123.2063036,] }],
      arcColor: [0.3, 0.5, 1],
      arcWidth: 0.9,
      arcHeight: 0.4,
    });

    // Animate the globe
    let phi = 0;
    function animate() {
      phi += 0.005;
      globe.update({ phi });
      requestAnimationFrame(animate);
    }
    animate();
  });
</script>

<canvas bind:this={canvas} style="width: 100%"></canvas>

<style lang="scss">
</style>
