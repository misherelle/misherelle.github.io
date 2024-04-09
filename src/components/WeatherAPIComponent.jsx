import React, { useState, useEffect } from "react";

const WeatherAPIComponent = ({ onWeatherDataFetched }) => {
  const [index, setIndex] = useState("");
  const [weatherData, setWeatherData] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("GET");
  const [apiSource, setApiSource] = useState("");
  const [selectedAPI, setSelectedAPI] = useState("");
  const [city, setCity] = useState("");
  const [updateIndex, setUpdateIndex] = useState("");
  const [updateFahrenheit, setUpdateFahrenheit] = useState("");
  const [updateWeatherCondition, setUpdateWeatherCondition] = useState("");
  const [deleteIndex, setDeleteIndex] = useState("");

  const handleInputChange = (event) => {
    setIndex(event.target.value);
  };

  // Function to fetch weather data (first GET button)
  const fetchWeatherData = async (index = "") => {
    setError("");
    setWeatherData([]);

    const endpoint = index ? `/weatherData/${index}` : "/weatherData";
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(typeof onWeatherDataFetched);
      setWeatherData(Array.isArray(data) ? data : [data]);
      onWeatherDataFetched(Array.isArray(data) ? data : [data]);
    } catch (error) {
      setError(`Fetching failed: ${error.message}`);
    }
  };

  // Fetch weather data when apiSource changes (second GET button)
  useEffect(() => {
    if (apiSource) {
      fetchWeatherDataBySource(apiSource);
    }
  }, [apiSource]);

  const handleApiSourceChange = (event) => {
    setApiSource(event.target.value);
  };

  // Function to fetch weather data by API source (second GET button)
  const fetchWeatherDataBySource = async (source) => {
    setError("");
    setWeatherData([]);

    try {
      const response = await fetch(`http://localhost:3000/weatherData`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      // Filtering data based on selected API source
      const filteredData = data.filter(
        (item) => item.whichAPI === parseInt(source)
      );
      setWeatherData(filteredData);
      onWeatherDataFetched(filteredData);
    } catch (error) {
      setError(`Fetching failed: ${error.message}`);
    }
  };

  // Handling GET click to fetch weather data
  const handleGetClick = () => {
    fetchWeatherData(index.trim());
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleApiSelection = (event) => {
    setSelectedAPI(event.target.value);
  };

  // POST functionality to fetch and save weather data
  const handlePostWeatherData = async () => {
    setError("");

    try {
      // Preparing request body with city and API source
      const requestBody = {
        city: city,
        apiSource: selectedAPI,
      };

      // Calling server's endpoint to fetch from external API and save to MongoDB
      const response = await fetch(
        "http://localhost:3000/fetchAndSaveWeather",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const savedData = await response.json();

      // Updating UI with newly added data
      setWeatherData((prevWeatherData) => [...prevWeatherData, savedData]);
      alert("Weather data added successfully.");
    } catch (error) {
      setError(`Operation failed: ${error.message}`);
    }
  };

  // PUT for updating data
  const handlePutClick = async () => {
    setError("");
    const celsius = ((updateFahrenheit - 32) * 5) / 9; // Converting Fahrenheit to Celsius

    const updatedData = {
      temperature: {
        celsius,
        fahrenheit: parseFloat(updateFahrenheit),
      },
      weatherCondition: updateWeatherCondition,
    };

    try {
      const response = await fetch(
        `http://localhost:3000/weatherData/${updateIndex}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error(`HTTP status ${response.status}`);

      // Fetching updated data
      if (updateIndex) {
        // Fetching updated entry by index
        const updatedEntryResponse = await fetch(
          `http://localhost:3000/weatherData/${updateIndex}`
        );
        const updatedEntryData = await updatedEntryResponse.json();
        setWeatherData([updatedEntryData]); // Updaing  UI to show only updated entry
      } else {
        // Fetching all entries if no index was provided for update
        const allEntriesResponse = await fetch(
          `http://localhost:3000/weatherData`
        );
        const allEntriesData = await allEntriesResponse.json();
        setWeatherData(allEntriesData); // Updating UI to show all entries
      }
      alert("Weather data updated successfully.");
    } catch (error) {
      console.error("Error during PUT request:", error);
      setError(`An error occurred, please try again.`);
    }
  };

  // Function to handle the delete operation
  const handleDeleteClick = async () => {
    setError(""); // Resetting existing error messages

    try {
      // Constructing endpoint URL based on whether index is provided
      const endpoint = deleteIndex.trim()
        ? `/weatherData/${deleteIndex}`
        : "/weatherData";
      // Making DELETE request to server
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`HTTP status ${response.status}`);

      // Showing success message
      alert("Weather data deleted successfully.");

      // Clearing deleteIndex input field
      setDeleteIndex("");

      // Fetching and updating displayed data to reflect deletion
      const updatedDataResponse = await fetch(
        `http://localhost:3000/weatherData`
      );
      const updatedData = await updatedDataResponse.json();
      setWeatherData(updatedData); // Updating state to refresh displayed weather data
    } catch (error) {
      console.error("Error during DELETE request:", error);
      setError(`An error occurred, please try again.`);
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => setActiveTab("GET_INDEX")}>GET By Index</button>
        <button onClick={() => setActiveTab("GET_SOURCE")}>
          GET By API Source
        </button>
        <button onClick={() => setActiveTab("POST")}>POST</button>
        <button onClick={() => setActiveTab("PUT")}>PUT</button>
        <button onClick={() => setActiveTab("DELETE")}>DELETE</button>
      </div>

      {activeTab === "GET_INDEX" && (
        <>
          <input
            type="text"
            value={index}
            onChange={handleInputChange}
            placeholder="Index (blank = ALL)"
          />
          <button onClick={handleGetClick}>Fetch Weather</button>
        </>
      )}

      {activeTab === "GET_SOURCE" && (
        <>
          <select value={apiSource} onChange={handleApiSourceChange}>
            <option value="">Select API Source</option>
            <option value="1">API 1</option>
            <option value="2">API 2</option>
            <option value="3">API 3</option>
          </select>
        </>
      )}

      {activeTab === "POST" && (
        <>
          <select value={selectedAPI} onChange={handleApiSelection}>
            <option value="">Select API Source</option>
            <option value="1">API 1</option>
            <option value="2">API 2</option>
            <option value="3">API 3</option>
          </select>
          <input
            type="text"
            value={city}
            onChange={handleCityChange}
            placeholder="Enter city name"
          />
          <button onClick={handlePostWeatherData}>
            Fetch & Save Weather Data
          </button>
        </>
      )}

      {activeTab === "PUT" && (
        <>
          <input
            type="text"
            value={updateIndex}
            onChange={(e) => setUpdateIndex(e.target.value)}
            placeholder="Index (blank = ALL)"
          />
          <input
            type="number"
            value={updateFahrenheit}
            onChange={(e) => setUpdateFahrenheit(e.target.value)}
            placeholder="New Temperature (°F)"
          />
          <input
            type="text"
            value={updateWeatherCondition}
            onChange={(e) => setUpdateWeatherCondition(e.target.value)}
            placeholder="New Weather Condition"
          />
          <button onClick={handlePutClick}>Update</button>
        </>
      )}

      {activeTab === "DELETE" && (
        <>
          <input
            type="text"
            value={deleteIndex}
            onChange={(e) => setDeleteIndex(e.target.value)}
            placeholder="Index (blank = ALL)"
          />
          <button onClick={handleDeleteClick}>Delete</button>
        </>
      )}

      {/* Error */}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Data */}
      <div>
        {weatherData.length > 0 ? (
          weatherData.map((data, idx) => (
            <div
              key={idx}
              style={{
                marginTop: "20px",
                padding: "10px",
                border: "1px solid #ddd",
              }}
            >
              <div>Index: {data.index}</div>
              <div>API Source: {data.whichAPI}</div>
              <div>City: {data.city}</div>
              <div>Country: {data.country}</div>
              <div>
                Temperature: {data.temperature?.celsius} °C /{" "}
                {data.temperature?.fahrenheit} °F
              </div>
              <div>Wind Speed: {data.wind?.speed_kph} kph</div>
              <div>Humidity: {data.humidity}%</div>
              <div>Weather Condition: {data.weatherCondition}</div>
            </div>
          ))
        ) : (
          <p>No weather data found.</p>
        )}
      </div>
    </div>
  );
};

export default WeatherAPIComponent;