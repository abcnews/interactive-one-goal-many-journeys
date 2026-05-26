import { Effect } from "effect";
import { type Island, prepareIslands } from "./lib/islands";
import { waitForDOM, waitForOdyssey } from "./lib/env";

import "./main.scss";
import GlobeMount from "./islands/GlobeMount.svelte";
import Utils from "./islands/Utils.svelte";
import Map from "./islands/Map.svelte";

const articleIslands: Island[] = [
  {
    name: "utils",
    component: Utils,
    mountOn: "load",
    mountTo: document.body,
  },
  {
    name: "globe",
    component: GlobeMount,
    mountOn: "visible",
  },
];

const demoIslands: Island[] = [
  {
    name: "map", // Demo map in index.html
    component: Map,
    mountOn: "visible",
  },
];

const initProgram = Effect.gen(function* () {
  yield* waitForDOM;
  yield* waitForOdyssey;
  prepareIslands({ islands: [...articleIslands, ...demoIslands] });
  return "Interactive Initialised";
});

Effect.runPromise(initProgram)
  .then((result) => console.log("Started:", result))
  .catch((error) => console.error("Failed:", error));
