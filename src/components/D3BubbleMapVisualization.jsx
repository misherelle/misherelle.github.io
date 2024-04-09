import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { geoMercator } from 'd3-geo';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const D3BubbleMapVisualization = ({ data }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (data && d3Container.current) {
      const svg = d3.select(d3Container.current);
      svg.selectAll("*").remove(); // Clearing previous SVG elements

      const width = 1100, height = 600;
      svg.attr('viewBox', `0 0 ${width} ${height}`);

      // Setting up for projection and path
      const projection = geoMercator()
        .scale(200)
        .center([0, 20])
        .translate([width / 2, height / 2]);

      // Temperature color scale
      const tempColorScale = d3.scaleSequential()
        .domain(d3.extent(data, d => d.temperature.celsius))
        .interpolator(d3.interpolateCool);

      // Wind speed size scale
      const windSpeedScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.wind.speed_kph))
        .range([6, 23]);

      // Adding bubbles and initializing Tippy.js for each bubble
      svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => projection([d.coordinates.longitude, d.coordinates.latitude])[0])
        .attr("cy", d => projection([d.coordinates.longitude, d.coordinates.latitude])[1])
        .attr("r", d => windSpeedScale(d.wind.speed_kph))
        .attr("fill", d => tempColorScale(d.temperature.celsius))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .each(function(d) { // Initializing Tippy.js for each circle
          tippy(this, {
            content: `<strong>${d.city}, ${d.country}</strong><br>Temp: ${d.temperature.celsius}°C, ${d.temperature.fahrenheit}°F<br>Wind: ${d.wind.speed_kph} kph (${d.wind.direction})`,
            allowHTML: true,
          });
        });
    }
  }, [data]); // Triggering rerender on data change

  return <svg className="d3-component" ref={d3Container} style={{ width: '100%', height: 'auto' }} />;
};

export default D3BubbleMapVisualization;
