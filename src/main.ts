import { Effect, Match } from "effect";
import { waitForDOM, waitForOdyssey } from "./lib/env";
import { mount } from "svelte";

import "./main.scss";

import App from "./App.svelte";

const initProgram = Effect.gen(function* () {
  yield* waitForDOM;
  yield* waitForOdyssey;

  mount(App, {
    target: document.getElementById("stage")!,
  });

  return "Interactive initialised...";
});

Effect.runPromise(initProgram)
  .then((result) => console.log("Started:", result))
  .catch((error) => console.error("Failed:", error));
