<script lang="ts">
  import { fade } from "svelte/transition";

  import fallbackImage from "./willian-reis-8oFjCza0FNE-unsplash.png";
  import jxlImage from "./willian-reis-8oFjCza0FNE-unsplash.jxl";
</script>

<div class="container" in:fade={{ duration: 1000 }}>
  <picture>
    <source srcset={jxlImage} type="image/jxl" />
    <img src={fallbackImage} alt="placeholder" />
  </picture>
</div>

<style lang="scss">
  .container {
    margin-block-end: 1em;
  }

  img {
    border-radius: 50%;
  }
</style>
