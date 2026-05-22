<script lang="ts">
  import type { Chord, ChordGroup } from "d3";
  import { onMount } from "svelte";
  import d3 from "@lib/d3";

  onMount(() => {
    // create the svg area
    const svg = d3
      .select("#my_dataviz")
      .append("svg")
      .attr("width", 440)
      .attr("height", 440)
      .append("g")
      .attr("transform", "translate(220,220)");

    // create input data: a square matrix that provides flow between entities
    let matrix = [
      [11975, 5871, 8916, 2868],
      [1951, 10048, 2060, 6171],
      [8010, 16145, 8090, 8045],
      [1013, 990, 940, 6907],
    ];

    // matrix = [
    //   [10, 1, 1, 1],
    //   [1, 1, 1, 1],
    //   [1, 1, 1, 1],
    //   [1, 1, 1, 1],
    // ];

    // matrix = [
    // [9.6899,0.8859,0.0554,0.443,2.5471,2.4363,0.5537,2.5471], /*Apple 19.1584*/
    // [0.1107,1.8272,0,0.4983,1.1074,1.052,0.2215,0.4983], /*HTC 5.3154*/
    // [0.0554,0.2769,0.2215,0.2215,0.3876,0.8306,0.0554,0.3322], /*Huawei 2.3811*/
    // [0.0554,0.1107,0.0554,1.2182,1.1628,0.6645,0.4983,1.052], /*LG 4.8173*/
    // [0.2215,0.443,0,0.2769,10.4097,1.2182,0.4983,2.8239], /*Nokia 15.8915*/
    // [1.1628,2.6024,0,1.3843,8.7486,16.8328,1.7165,5.5925], /*Samsung 38.0399*/
    // [0.0554,0.4983,0,0.3322,0.443,0.8859,1.7719,0.443], /*Sony 4.4297*/
    // [0.2215,0.7198,0,0.3322,1.6611,1.495,0.1107,5.4264] /*Other 9.9667*/
    // ];

    // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    const res = d3
      .chord()
      .padAngle(0.05) // padding between entities (black arc)
      .sortSubgroups(d3.descending)(matrix);

    // add the groups on the inner part of the circle
    svg
      .datum(res)
      .append("g")
      .selectAll("g")
      .data((d) => d.groups)
      .join("g")
      .append("path")
      .style("fill", "grey")
      .style("stroke", "black")
      .attr("d", d3.arc<ChordGroup>().innerRadius(200).outerRadius(210));

    // Add the links between groups
    svg
      .datum(res)
      .append("g")
      .selectAll("path")
      .data((d) => d)
      .join("path")
      .attr("d", d3.ribbon<Chord, ChordGroup>().radius(200))
      .style("fill", "#69b3a2")
      .style("stroke", "black");
  });
</script>

<div id="my_dataviz"></div>
