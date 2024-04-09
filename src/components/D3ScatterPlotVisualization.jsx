import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const D3ScatterPlotVisualization = ({ data }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (data && d3Container.current) {
      const svg = d3.select(d3Container.current);
      svg.selectAll("*").remove(); // Clearing previous SVG elements

      const margin = { top: 20, right: 30, bottom: 40, left: 50 },
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

      const x = d3.scaleLinear()
                  .domain([0, d3.max(data, d => d.temperature.celsius)])
                  .range([0, width]);
      svg.append("g")
         .attr("transform", `translate(${margin.left}, ${height + margin.top})`)
         .call(d3.axisBottom(x));

      const y = d3.scaleLinear()
                  .domain([0, d3.max(data, d => d.humidity)])
                  .range([height, 0]);
      svg.append("g")
         .attr("transform", `translate(${margin.left}, ${margin.top})`)
         .call(d3.axisLeft(y));

      // Adding dots
      const dots = svg.append('g')
                      .selectAll("dot")
                      .data(data)
                      .enter()
                      .append("circle")
                        .attr("cx", d => x(d.temperature.celsius) + margin.left)
                        .attr("cy", d => y(d.humidity) + margin.top)
                        .attr("r", 5)
                        .style("fill", "#69b3a2");

      // Initializing Tippy.js on dots
      dots.nodes().forEach(node => {
        tippy(node, {
          content: `Temperature: ${node.__data__.temperature.celsius}°C, ${node.__data__.temperature.fahrenheit}°F<br>Humidity: ${node.__data__.humidity}%`,
          allowHTML: true,
        });
      });

      // X label
      svg.append("text")
         .attr("text-anchor", "end")
         .attr("x", width / 2 + margin.left)
         .attr("y", height + margin.top + 30)
         .text("Temperature (°C)");

      // Y label
      svg.append("text")
         .attr("text-anchor", "end")
         .attr("transform", "rotate(-90)")
         .attr("y", margin.left - 40)
         .attr("x", -margin.top - height/2 + 20)
         .text("Humidity (%)")
    }
  }, [data]);

  return <svg className="d3-component" width="460" height="400" ref={d3Container} />;
};

export default D3ScatterPlotVisualization;
