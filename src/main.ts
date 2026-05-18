import { Effect } from "effect";
import { type Island, observeIslands, mountIsland } from "./lib/islands";
import { waitForDOM, waitForOdyssey } from "./lib/env";

import "./main.scss";

const islands: Island[] = [];

const initProgram = Effect.gen(function* () {
  yield* waitForDOM;
  yield* waitForOdyssey;
  observeIslands({ islands });
  return "Initialised";
});

Effect.runPromise(initProgram).then(console.log, console.error);
