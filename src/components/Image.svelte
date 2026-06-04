<script lang="ts">
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

  let visible = $derived.by(() => {
    if (imageName === null) return false;
    else return true;
  });
</script>

<img
  src={getImage("babymatthewryan") || ""}
  alt="Baby Matthew Ryan"
  class={{ visible: visible }}
/>

<style lang="scss">
  img {
    z-index: -1;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 16px;
    opacity: 0;
    filter: blur(6px);
    transition:
      opacity 0.9s ease-in-out,
      filter 0.9s ease-in-out;

    &.visible {
      opacity: 1;
      filter: blur(0px);
    }
  }
</style>
