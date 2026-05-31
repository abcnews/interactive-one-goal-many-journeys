class ReducedMotionStore {
  #value = $state(
    typeof document !== 'undefined'
      ? document.body.classList.contains('is-reduced-motion')
      : false
  );

  get current() {
    return this.#value;
  }

  observe() {
    const observer = new MutationObserver(() => {
      this.#value = document.body.classList.contains('is-reduced-motion');
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      childList: false,
      characterData: false
    });

    return () => observer.disconnect();
  }
}

export const reducedMotion = new ReducedMotionStore();
