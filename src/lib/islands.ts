import type { Component } from "svelte";
import { mount } from "svelte";
import { Match } from "effect";

const { when, exhaustive } = Match;

type MountMethod = "load" | "visible";

export type Island = {
  name: string;
  component: Component;
  mountOn: MountMethod;
  mountTo?: HTMLElement;
};

export const mountIsland = ({
  island,
  entry,
}: {
  island: Island;
  entry: IntersectionObserverEntry;
}) => {
  return mount(island.component, { target: entry.target as HTMLElement });
};

export function prepareIslands({
  islands = [],
  onObservation = mountIsland,
}: {
  islands: Island[];
  onObservation?: ({
    island,
    entry,
  }: {
    island: Island;
    entry: IntersectionObserverEntry;
  }) => {};
}) {
  const islandObservationMap = new Map<HTMLElement, Island>();

  const handleEntry = (entry: IntersectionObserverEntry) => {
    const island = islandObservationMap.get(entry.target as HTMLElement);
    if (!island) return;

    if (entry.isIntersecting) {
      onObservation({ island, entry });
      observer.unobserve(entry.target);
    }
  };

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(handleEntry);
  };

  const observer = new IntersectionObserver(handleIntersection);

  function instantMount(island: Island) {
    const target = island.mountTo || document.getElementById(island.name);
    if (!target) return;
    mount(island.component, { target: target as HTMLElement });
  }

  function addToObserver(island: Island) {
    const target = island.mountTo || document.getElementById(island.name);
    if (!target) return;
    islandObservationMap.set(target, island);
    observer.observe(target);
  }

  islands.forEach((island) => {
    Match.value<MountMethod>(island.mountOn).pipe(
      when("load", () => instantMount(island)),
      when("visible", () => addToObserver(island)),
      exhaustive,
    );
  });
}
