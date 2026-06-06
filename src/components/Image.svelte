<script lang="ts">
  import { blur } from "svelte/transition";
  import babyMatthewRyan from "@assets/images/babymatthewryan.jpg";

  type Props = {
    imageName: string | null;
  };

  let { imageName = null }: Props = $props();

  const imageMap = new Map<string, string>([
    ["babymatthewryan", babyMatthewRyan],
  ]);

  const getImage = (filename: string | null) => {
    if (filename === null) return null;
    return imageMap.get(filename) ?? null;
  };

  let src = $derived(getImage(imageName));
</script>

{#if src !== null}
  <img {src} alt="Baby Matthew Ryan" transition:blur />
{/if}

<style lang="scss">
  img {
    z-index: -1;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 16px;
  }
</style>
