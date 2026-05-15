import { Effect } from "effect";
import { type Island, observeIslands, mountIsland } from "./lib/islands";
import { waitForDOM, waitForOdyssey } from "./lib/env";

import Chord2 from "./islands/Chord2.svelte";

const islands: Island[] = [
  {
    name: "chord",
    component: Chord2,
  },
];

const initProgram = Effect.gen(function* () {
  yield* waitForDOM;
  yield* waitForOdyssey;
  observeIslands({ islands });
});

Effect.runPromise(initProgram);
