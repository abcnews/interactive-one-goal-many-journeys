import { Effect } from "effect";
import { type Island, observeIslands, mountIsland } from "./lib/islands";
import { waitForDOM, waitForOdyssey } from "./lib/env";

import "./main.scss";

import Map from "./islands/Map.svelte";

const islands: Island[] = [
  {
    name: "map",
    component: Map,
  },
];

const initProgram = Effect.gen(function* () {
  yield* waitForDOM;
  yield* waitForOdyssey;
  observeIslands({ islands });
  return "Initialised";
});

Effect.runPromise(initProgram)
  .then((result) => console.log("Started:", result))
  .catch((error) => console.error("Failed:", error));
