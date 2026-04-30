import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { whenDOMReady, whenOdysseyLoaded } from "@abcnews/env-utils";

type Island = {
  name: string;
  component: typeof App;
};

const islands = [
  {
    name: "app",
    component: App,
  },
];

function observeIslands() {
  const islandMap = new Map<HTMLElement, Island>();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const island = islandMap.get(entry.target as HTMLElement);
      if (!island) return;

      if (entry.isIntersecting) {
        mount(island.component, { target: entry.target as HTMLElement });
        observer.unobserve(entry.target);
      }
    });
  });

  islands.forEach((island) => {
    const target = document.getElementById(island.name);
    if (!target) return;
    islandMap.set(target, island);
    observer.observe(target);
  });
}

async function init() {
  await whenDOMReady;
  await whenOdysseyLoaded;

  observeIslands();
}

const app = init();
export default app;
