class AppState {
  isLoaded = $state(false);
  // doubled = $derived(this.value * 2);

  setIsLoaded() {
    this.isLoaded = true;
  }
}

export const appState = new AppState();
