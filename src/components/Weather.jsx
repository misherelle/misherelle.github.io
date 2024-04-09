import React, { useState, useEffect } from 'react';
import './Weather.css';
import WeatherAPIComponent from './WeatherAPIComponent';
import D3TemperatureVisualization from './D3TemperatureVisualization';
import D3ScatterPlotVisualization from './D3ScatterPlotVisualization';
import D3BubbleMapVisualization from './D3BubbleMapVisualization';
import D3HeatMapVisualization from './D3HeatMapVisualization';

const Weather = () => {
  const [D3weatherData, setD3WeatherData] = useState([]);

  useEffect(() => {
    console.log(D3weatherData);
  }, [D3weatherData]);

  return (
    <div className="weather-content">
      <img src="/sunshine.png" alt="Left" className="side-left-flower"/>
      <p id="weatherAPI">
        <strong>Weather Ticker</strong>
      </p>
      <p>Click one of the two GET options below ("GET By Index" or "GET By API Source") and get a set of data points to display visualizations!</p>
      <p class="small">(I recommend clicking "GET By Index" and fetching while its blank! Looks super cool.)</p>
      
      {/* Making sure visualizations only show up when data is selected */}
      {D3weatherData.length > 0 && (
        <>
          <p class="title">Temperature Bar Graph</p>
          <p>Hover over the bars to see the individual city temperatures!</p>
          <D3TemperatureVisualization data={D3weatherData} />
          <p class="title">Temperature/Humidity % Scatterplot</p>
          <p>Hover over the points to see the individual city temperatures/humidity %!</p>
          <D3ScatterPlotVisualization data={D3weatherData} />
          <br></br>
          <br></br>
          <p class="title">Wind Speed Bubble Map</p>
          <p>Hover over the points to see the individual city temperatures and wind speed! The bigger the circle, the higher the wind speed.</p>
          <D3BubbleMapVisualization data={D3weatherData} />
          <p class="title">Heat Map</p>
          <p>Hover over the points to see the individual city data! The color gradient, from dark to light blue, represents temperatures from cooler to warmer, respectively.</p>
          <D3HeatMapVisualization data={D3weatherData} />
        </>
      )}
      
      <WeatherAPIComponent onWeatherDataFetched={setD3WeatherData} />
      <img src="/rain.png" alt="Right" className="side-right-flower"/>
    </div>
  );
};

export default Weather;