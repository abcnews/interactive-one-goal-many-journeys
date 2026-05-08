import type { Component } from "svelte";

export type Island = {
  name: string;
  component: Component;
};

export function observeIslands({
  islands = [],
  onObservation = () => {},
}: {
  islands: Island[];
  onObservation?: ({
    island,
    entry,
  }: {
    island: Island;
    entry: IntersectionObserverEntry;
  }) => void;
}) {
  const islandMap = new Map<HTMLElement, Island>();

  const handleEntry = (entry: IntersectionObserverEntry) => {
    const island = islandMap.get(entry.target as HTMLElement);
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

  islands.forEach((island) => {
    const target = document.getElementById(island.name);
    if (!target) return;
    islandMap.set(target, island);
    observer.observe(target);
  });
}
