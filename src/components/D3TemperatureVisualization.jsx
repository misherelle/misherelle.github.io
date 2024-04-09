import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const D3TemperatureVisualization = ({ data }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (data && d3Container.current) {
      const svg = d3.select(d3Container.current);
      svg.selectAll("*").remove(); // Clearing previous SVG elements

      const width = 400, height = 300;
      svg.attr('width', width).attr('height', height);

      const maxTemp = Math.max(...data.map(d => d.temperature.fahrenheit)) + 5;
      const yScale = d3.scaleLinear().domain([0, maxTemp]).range([height - 20, 0]);
      const xScale = d3.scaleBand().domain(data.map((_, i) => i)).rangeRound([0, width]).padding(0.1);

      const bars = svg.selectAll(".bar")
         .data(data)
         .enter().append("rect")
         .attr("class", "bar")
         .attr("x", (_, i) => xScale(i))
         .attr("y", d => yScale(d.temperature.fahrenheit))
         .attr("width", xScale.bandwidth())
         .attr("height", d => height - 20 - yScale(d.temperature.fahrenheit))
         .attr("fill", "steelblue");

      // Initializing Tippy.js for each bar
      bars.each(function(d) {
        tippy(this, {
          content: `Temperature: ${d.temperature.celsius}°C, ${d.temperature.fahrenheit}°F`,
        });
      });
    }
  }, [data]);

  return <svg className="d3-component" ref={d3Container} />;
};

export default D3TemperatureVisualization;
