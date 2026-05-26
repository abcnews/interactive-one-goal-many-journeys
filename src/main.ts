import { Effect } from "effect";
import { type Island, prepareIslands } from "./lib/islands";
import { waitForDOM, waitForOdyssey } from "./lib/env";

import "./main.scss";
import GlobeMount from "./islands/GlobeMount.svelte";
import Utils from "./islands/Utils.svelte";
import Map from "./islands/Map.svelte";

const islands: Island[] = [
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
  {
    name: "map",
    component: Map,
    mountOn: "visible",
  }
];

const initProgram = Effect.gen(function* () {
  yield* waitForDOM;
  yield* waitForOdyssey;
  prepareIslands({ islands });
  return "Initialised";
});

Effect.runPromise(initProgram)
  .then((result) => console.log("Started:", result))
  .catch((error) => console.error("Failed:", error));
