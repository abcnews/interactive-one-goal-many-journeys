class ReducedMotionStore {
  #value = $state(
    typeof document !== "undefined"
      ? document.body.classList.contains("is-reduced-motion")
      : false,
  );

  get current() {
    return this.#value;
  }

  #sync() {
    this.#value = document.body.classList.contains("is-reduced-motion");
  }

  observe() {
    this.#sync();

    const observer = new MutationObserver(() => this.#sync());

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      childList: false,
      characterData: false,
    });

    return () => observer.disconnect();
  }
}

export const reducedMotion = new ReducedMotionStore();
