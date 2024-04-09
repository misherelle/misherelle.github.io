import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const D3HeatMapVisualization = ({ data }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (data && d3Container.current) {
      const svg = d3.select(d3Container.current);
      svg.selectAll("*").remove(); // Clearing previous SVG elements

      const margin = { top: 30, right: 0, bottom: 70, left: 0 },
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

      svg.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
         .append("g")
         .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand()
                  .range([ 0, width ])
                  .domain(data.map(d => d.time))
                  .padding(0.05);
      svg.append("g")
         .attr("transform", `translate(0, ${height})`)
         .call(d3.axisBottom(x))

      const y = d3.scaleBand()
                  .range([ height, 0 ])
                  .domain(data.map(d => d.city))
                  .padding(0.05);
      svg.append("g")
         .call(d3.axisLeft(y));

      const myColor = d3.scaleSequential()
                        .interpolator(d3.interpolateCool)
                        .domain([d3.min(data, d => d.temperature.celsius), d3.max(data, d => d.temperature.celsius)]);

      svg.selectAll()
         .data(data, d => `${d.time}:${d.city}`)
         .join("rect")
         .attr("x", d => x(d.time))
         .attr("y", d => y(d.city))
         .attr("width", x.bandwidth())
         .attr("height", y.bandwidth())
         .style("fill", d => myColor(d.temperature.celsius))
         .each(function(d) {
           tippy(this, {
             content: `City: ${d.city}<br>Temp: ${d.temperature.celsius.toFixed(2)}°C, ${d.temperature.fahrenheit.toFixed(2)}°F<br>Condition: ${d.weatherCondition}<br>Wind: ${d.wind.speed_kph.toFixed(2)} kph`,
             allowHTML: true,
           });
         });
    }
  }, [data]);

  return <svg className="d3-component" ref={d3Container} />;
};

export default D3HeatMapVisualization;
