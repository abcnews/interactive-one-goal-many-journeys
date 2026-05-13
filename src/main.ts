import { mount } from "svelte";
import { whenDOMReady, whenOdysseyLoaded } from "@abcnews/env-utils";

// Types
import { type Island, observeIslands } from "./lib/islands";

// Components
import Cobe from "./islands/Cobe.svelte";
import Chord from "./islands/Chord.svelte";
import Chord2 from "./islands/Chord2.svelte";

const islands: Island[] = [
  {
    name: "chord",
    component: Chord2,
  },
];

const mountIsland = ({
  island,
  entry,
}: {
  island: Island;
  entry: IntersectionObserverEntry;
}) => {
  mount(island.component, { target: entry.target as HTMLElement });
};

async function init() {
  await whenDOMReady;
  await whenOdysseyLoaded;

  observeIslands({ islands, onObservation: mountIsland });
}

const app = init();
export default app;
