class AppState {
  #windowInnerWidth = $state(800);

  get windowInnerWidth() {
    return this.#windowInnerWidth;
  }

  setWindowInnerWidth(width: number) {
    this.#windowInnerWidth = width;
  }

  isLoaded = $state(false);

  setIsLoaded() {
    this.isLoaded = true;
  }
}

export const appState = new AppState();
