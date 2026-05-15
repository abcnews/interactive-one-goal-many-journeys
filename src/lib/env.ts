import { Effect } from "effect";
import { whenDOMReady, whenOdysseyLoaded } from "@abcnews/env-utils";

export const waitForDOM = Effect.tryPromise({
  try: () => whenDOMReady,
  catch: (error) => new Error(`DOM readiness failed: ${error}`),
});

export const waitForOdyssey = Effect.tryPromise({
  try: () => whenOdysseyLoaded,
  catch: (error) => new Error(`Odyssey failed to load: ${error}`),
});
