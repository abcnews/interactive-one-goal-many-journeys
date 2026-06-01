import { Effect, Match, Duration } from "effect";
import { waitForDOM, waitForOdyssey } from "./lib/env";
import { mount } from "svelte";

import "./styles/main.scss";

import App from "./App.svelte";

const task = Effect.gen(function* () {
  const odyssey = yield* waitForOdyssey;
  return odyssey;
});

const initProgram = Effect.gen(function* () {
  yield* waitForDOM;
  yield* task.pipe(Effect.timeout(Duration.seconds(10)));

  mount(App, {
    target: document.getElementById("stage")!,
  });

  return "Interactive initialised...";
});

Effect.runPromise(initProgram)
  .then((result) => console.log("Started:", result))
  .catch((error) => console.error("Failed:", error));
