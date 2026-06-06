import { ScrollState, ElementSize, watch, watchOnce, Previous } from "runed";

class PageState {
  bodySize = new ElementSize(() => document.body);
  scrollY = $state(0);
}

export const pageState = new PageState();
