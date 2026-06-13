<script lang="ts">
  // const pictures = document.querySelectorAll('[data-component="Figure"]');
  import { onMount } from "svelte";

  onMount(() => {
    const figures = document.querySelectorAll('[data-component="Figure"] img');
    figures.forEach((img) => {
      const el = img as HTMLImageElement;
      const apply = () => {
        if (el.naturalWidth > el.naturalHeight) {
          // Landscape
          el.closest('[data-component="Figure"]')?.classList.add(
            "is-landscape",
          );
        }
      };
      if (el.complete) {
        apply();
      } else {
        el.addEventListener("load", apply);
      }
    });
  });
</script>

<style lang="scss">
  :global {
    [data-component="Figure"] {
      transform: unset !important;
      max-width: 400px !important;

      figcaption {
        color: white;
        display: none;
      }
    }

    [data-component="Figure"].is-landscape {
      max-width: 500px !important;
    }

    [data-component="Figure"] [data-component="AspectRatioContainer"] img {
      border-radius: 16px;
    }
  }
</style>
