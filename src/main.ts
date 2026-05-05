import { mount } from "svelte";
import "./styles/main.css";
import App from "./App.svelte";
import Cobe from "./islands/Cobe.svelte";
import { whenDOMReady, whenOdysseyLoaded } from "@abcnews/env-utils";
import { type Island, observeIslands } from "./lib/islands";

const islands: Island[] = [
  // {
  //   name: "app",
  //   component: App,
  // },
  {
    name: "globe",
    component: Cobe,
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
