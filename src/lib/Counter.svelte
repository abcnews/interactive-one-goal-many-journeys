<script lang="ts">
  let count: number = $state(0);
  const increment = () => {
    count += 1;
  };
</script>

<button type="button" class="counter" onclick={increment}>
  Count is {count}
</button>

<style>
  .counter {
    font-family: var(--mono);
    display: inline-flex;
    border-radius: 4px;
    color: var(--text-h);
  }

  .counter {
    font-size: 16px;
    padding: 5px 10px;
    border-radius: 5px;
    color: var(--accent);
    background: var(--accent-bg);
    border: 2px solid transparent;
    transition: border-color 0.3s;
    margin-bottom: 24px;

    &:hover {
      border-color: var(--accent-border);
    }
    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
  }
</style>
