<script lang="ts">
  import d3 from "@lib/d3";
  import { onMount } from "svelte";

  let svgEl: SVGElement;

  // ── Data: one arc per player ─────────────────────────────────────────────────
  // country is used for colour grouping
  const players = [
    { name: "Ryan", country: "Australia", color: "Salmon" },
    { name: "Overy", country: "Australia", color: "Salmon" },
    { name: "Boyle", country: "Scotland", color: "DeepPink" },
    { name: "Burgess", country: "Scotland", color: "DeepPink" },
    { name: "Souttar", country: "Scotland", color: "DeepPink" },
    { name: "Degenek", country: "Croatia", color: "Orange" },
    { name: "H. Touré", country: "Guinea", color: "RoyalBlue" },
    { name: "M. Touré", country: "Guinea", color: "RoyalBlue" },
    { name: "Okon-Engstler", country: "Belgium", color: "DarkGreen" },
    { name: "Irankunda", country: "Tanzania", color: "DeepSkyBlue" },
  ];

  const trunk = { name: "Socceroos", color: "LightGreen" };

  // ── Margin constants (all in radians) ────────────────────────────────────────
  // Gap between the end of the top player block and the start of the Socceroos arc.
  // This is the "top/bottom section separator" — increase to widen the dead zone.
  const SECTION_GAP = 0.35;

  // Gap between individual player arcs in the top half.
  const PLAYER_PAD = 0.04;

  // How wide each player arc is. All players are equal width — the ribbon
  // thickness is constant since each represents exactly 1 player.
  const PLAYER_SPAN = 0.12; // radians per player arc

  // ── Derive top-half player arcs ──────────────────────────────────────────────
  // Total arc consumed by players + padding between them
  const playerBlockArc =
    players.length * PLAYER_SPAN + (players.length - 1) * PLAYER_PAD;

  // Centre the player block on the top of the circle (angle -π/2, i.e. 12 o'clock)
  // Top centre = -Math.PI / 2 = -1.5708 (or equivalently 3π/2 going clockwise)
  // D3 angles: 0 = 12 o'clock, increases clockwise
  const TOP_CENTRE = 0; // 12 o'clock in D3 convention (0 rad = top)
  const playerBlockStart = TOP_CENTRE - playerBlockArc / 2;

  let cursor = playerBlockStart;
  const playerArcs = players.map((p) => {
    const arc = {
      ...p,
      startAngle: cursor,
      endAngle: cursor + PLAYER_SPAN,
    };
    cursor += PLAYER_SPAN + PLAYER_PAD;
    return arc;
  });

  // ── Socceroos arc in the bottom half ─────────────────────────────────────────
  // Sits centred on angle π (6 o'clock), spanning whatever remains after gaps
  const playerBlockEnd = playerBlockStart + playerBlockArc;
  // Arc available to Socceroos = full circle minus player block minus two section gaps
  const socceroosSpan = 2 * Math.PI - playerBlockArc - 2 * SECTION_GAP;
  const socceroosStart = playerBlockEnd + SECTION_GAP;
  const socceroosEnd = socceroosStart + socceroosSpan;

  // Divide Socceroos arc into equal slices — one per player
  const sliceSpan = socceroosSpan / players.length;

  // ── Chord data ───────────────────────────────────────────────────────────────
  type ChordDatum = {
    source: { startAngle: number; endAngle: number };
    target: { startAngle: number; endAngle: number };
    color: string;
    name: string;
  };

  const chords: ChordDatum[] = playerArcs.map((p, i) => ({
    source: { startAngle: p.startAngle, endAngle: p.endAngle },
    target: {
      startAngle: socceroosStart + i * sliceSpan,
      endAngle: socceroosStart + (i + 1) * sliceSpan,
    },
    color: p.color,
    name: p.name,
  }));

  // ── Render ───────────────────────────────────────────────────────────────────
  const chart = () => {
    const width = 640;
    const height = width;
    const outerRadius = Math.min(width, height) * 0.5 - 60;
    const innerRadius = outerRadius - 22;

    const arcGen = d3
      .arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle((d) => d.startAngle)
      .endAngle((d) => d.endAngle);

    const ribbon = d3
      .ribbon<ChordDatum, { startAngle: number; endAngle: number }>()
      .radius(innerRadius);

    const svg = d3
      .select(svgEl)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height].join(" "))
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Ribbons
    svg
      .append("g")
      .attr("fill-opacity", 0.6)
      .selectAll("path")
      .data(chords)
      .join("path")
      .attr("d", (d) => ribbon(d) as any)
      .attr("fill", (d) => d.color)
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .append("title")
      .text((d) => `${d.name} → ${trunk.name}`);

    // Socceroos arc
    svg
      .append("path")
      .datum({ startAngle: socceroosStart, endAngle: socceroosEnd })
      .attr("d", (d) => arcGen(d) as string)
      .attr("fill", trunk.color)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .append("title")
      .text(`${trunk.name}: ${players.length} players`);

    // Player arcs
    svg
      .append("g")
      .selectAll("path")
      .data(playerArcs)
      .join("path")
      .attr("d", (d) => arcGen(d) as string)
      .attr("fill", (d) => d.color)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .append("title")
      .text((d) => `${d.name} (${d.country})`);

    // ── Labels ─────────────────────────────────────────────────────────────────
    const labelRadius = outerRadius + 14;

    // Player labels — radiate outward, flip text on the left side
    svg
      .append("g")
      .attr("font-size", 10)
      .selectAll("text")
      .data(playerArcs)
      .join("text")
      .attr("transform", (d) => {
        const mid = (d.startAngle + d.endAngle) / 2;
        const deg = (mid * 180) / Math.PI - 90;
        const flip = mid > Math.PI / 2 && mid < (3 * Math.PI) / 2;
        return `rotate(${deg}) translate(${labelRadius},0)${flip ? " rotate(180)" : ""}`;
      })
      .attr("text-anchor", (d) => {
        const mid = (d.startAngle + d.endAngle) / 2;
        return mid > Math.PI / 2 && mid < (3 * Math.PI) / 2 ? "end" : "start";
      })
      .attr("dy", "0.35em")
      .text((d) => d.name);

    // Socceroos label — centred at bottom
    const socceroosMid = (socceroosStart + socceroosEnd) / 2;
    const deg = (socceroosMid * 180) / Math.PI - 90;
    svg
      .append("text")
      .attr(
        "transform",
        `rotate(${deg}) translate(${labelRadius},0) rotate(180)`,
      )
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-weight", "bold")
      .attr("font-size", 12)
      .text(trunk.name);

    return svg.node();
  };

  onMount(() => {
    chart();
  });
</script>

<svg bind:this={svgEl}></svg>

<!-- <script lang="ts">
  import type { Chord, ChordGroup } from "d3";
  import d3 from "@lib/d3";
  import { onMount } from "svelte";

  let svgEl: SVGElement;

  const data = Object.assign(
    [
      [0, 1000, 1000, 1000],
      [200, 0, 0, 0],
      [200, 0, 0, 0],
      [200, 0, 0, 0],
    ],
    {
      names: ["Socceroos", "Australia", "Scotland", "Guinea"],
      colors: ["LightGreen", "Salmon", "DeepPink", "RoyalBlue"],
    },
  );

  function groupTicks(d: any, step: number) {
    const k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map((value) => {
      return { value: value, angle: value * k + d.startAngle };
    });
  }

  const chart = () => {
    const width = 640;
    const height = width;
    const outerRadius = Math.min(width, height) * 0.5 - 30;
    const innerRadius = outerRadius - 20;
    const { names, colors } = data;
    const sum = d3.sum(data.flat());
    const tickStep = d3.tickStep(0, sum, 100);
    const tickStepMajor = d3.tickStep(0, sum, 20);
    const formatValue = d3.formatPrefix(",.0", tickStep);

    const chord = d3
      .chord()
      .padAngle(20 / innerRadius)
      .sortSubgroups(d3.descending);

    const arc = d3
      .arc<ChordGroup>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbon<Chord, ChordGroup>().radius(innerRadius);

    const svg = d3
      .select(svgEl)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const chords = chord(data);

    const group = svg.append("g").selectAll().data(chords.groups).join("g");

    group
      .append("path")
      .attr("fill", (d) => colors[d.index])
      .attr("d", arc)
      .append("title")
      .text((d) => `${d.value.toLocaleString("en-US")} ${names[d.index]}`);

    const groupTick = group
      .append("g")
      .selectAll()
      .data((d) => groupTicks(d, tickStep))
      .join("g")
      .attr(
        "transform",
        (d) =>
          `rotate(${(d.angle * 180) / Math.PI - 90}) translate(${outerRadius},0)`,
      );

    groupTick.append("line").attr("stroke", "currentColor").attr("x2", 6);

    groupTick
      .filter((d) => d.value % tickStepMajor === 0)
      .append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", (d) =>
        d.angle > Math.PI ? "rotate(180) translate(-16)" : null,
      )
      .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : null))
      .text((d) => formatValue(d.value));

    svg
      .append("g")
      .attr("fill-opacity", 0.7)
      .selectAll()
      .data(chords)
      .join("path")
      .attr("d", ribbon)
      .attr("fill", (d) => colors[d.target.index])
      .attr("stroke", "white")
      .append("title")
      .text(
        (d) =>
          `${d.source.value.toLocaleString("en-US")} ${names[d.source.index]} → ${names[d.target.index]}${d.source.index !== d.target.index ? `\n${d.target.value.toLocaleString("en-US")} ${names[d.target.index]} → ${names[d.source.index]}` : ``}`,
      );

    return svg.node();
  };

  onMount(() => {
    chart();
  });
</script>

<svg bind:this={svgEl}></svg> -->
