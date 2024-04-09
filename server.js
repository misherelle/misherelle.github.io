const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
let fetch;
require('dotenv').config();
const https = require('https');

// Dynamically importing node-fetch
import('node-fetch').then(({
    default: fetchModule
}) => {
    fetch = fetchModule;
}).catch(err => console.error('Failed to load node-fetch:', err));

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'server', 'build')));

// CONNECTING MONGODB HERE:
mongoose.connect(process.env.MONGODB_URI).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Defining schema for stock data
const stockSchema = new mongoose.Schema({
    index: Number,
    symbol: String,
    name: String,
    sector: String,
    lastPrice: Number,
    marketCap: Number,
    date: String,
    time: String
}, {
    collection: 'appleStock'
});

// Compiling schema into model
const Stock = mongoose.model('Stock', stockSchema);

// Defining schema for unified weather data
const weatherSchema = new mongoose.Schema({
    index: Number,
    displayId: Number,
    whichAPI: Number,
    linkFromAPI: String,
    city: String,
    country: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    localTime: String,
    temperature: {
        celsius: Number,
        fahrenheit: Number
    },
    weatherCondition: String,
    wind: {
        speed_kph: Number,
        speed_mph: Number,
        direction: String
    },
    humidity: Number
}, {
    collection: 'weatherData'
});

// Creating model from schema
const Weather = mongoose.model('Weather', weatherSchema);

// LAB 6 (CURRENT):
const ACCUWEATHER_API_KEY = 'cpObAwkyAABScAg2sXiaIa6dYTX2W8BP';
const OPENWEATHER_API_KEY = 'c191b260c6f4281dfde39d1caabd2e5f';
const WEATHERAPI_API_KEY = '07bb2350e8ad42b291e185841243103';

// Defining GET endpoint for AccuWeather
app.get('/fetch-accuweather', async (req, res) => {
    const url = `http://dataservice.accuweather.com/currentconditions/v1/topcities/100?apikey=${ACCUWEATHER_API_KEY}`;

    try {
        const response = await fetch(url);
        const rawData = await response.json();

        const weatherData = [];
        for (const cityWeather of rawData) {
            const cityName = cityWeather.EnglishName;

            const lastEntry = await Weather.findOne().sort({ index: -1 });
            const nextIndex = lastEntry ? lastEntry.index + 1 : 1;

            // Ensuring apiSource is a number
            const apiSource = 1;
            if (typeof apiSource !== 'number') {
                throw new Error(`apiSource is not a number: ${apiSource}`);
            }

            const transformedData = transformAccuWeather(cityWeather, apiSource, url, nextIndex);

            const weatherDocument = new Weather(transformedData);
            await weatherDocument.save();

            weatherData.push(transformedData);
        }

        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send('An error occurred while fetching weather data.');
    }
});

// Transform function for WeatherAPI
function transformAccuWeather(data, apiSource, apiLink, index) {
    return {
        index,
        whichAPI: apiSource,
        linkFromAPI: apiLink,
        city: data.EnglishName,
        country: data.Country?.EnglishName,
        coordinates: {
            latitude: data.GeoPosition?.Latitude,
            longitude: data.GeoPosition?.Longitude,
        },
        localTime: data.LocalObservationDateTime,
        temperature: {
            celsius: data.Temperature?.Metric?.Value,
            fahrenheit: data.Temperature?.Imperial?.Value
        },
        weatherCondition: data.WeatherText,
        wind: {
            speed_kph: data.Wind?.Speed?.Metric?.Value ?? 0,
            speed_mph: data.Wind?.Speed?.Imperial?.Value ?? 0,
            direction: data.Wind?.Direction?.English ?? 'N/A',
        },
        humidity: data.RelativeHumidity ?? 0
    };
}

// List of 100 cities for first 100 calls
const cities = [
  'Tokyo', 'Delhi', 'Shanghai', 'Sao Paulo', 'Mumbai', 'Mexico City', 'Beijing', 'Osaka', 'Cairo', 'New York',
  'Dhaka', 'Karachi', 'Buenos Aires', 'Kolkata', 'Istanbul', 'Rio de Janeiro', 'Manila', 'Lagos', 'Rio de Janeiro', 'Los Angeles',
  'Paris', 'Moscow', 'Lima', 'Bangkok', 'London', 'New York', 'Bengaluru', 'Ho Chi Minh City', 'Bangalore', 'Bangkok',
  'Hong Kong', 'Madrid', 'Kathmandu', 'Toronto', 'Sydney', 'Melbourne', 'Singapore', 'Dubai', 'Istanbul', 'Lahore',
  'Berlin', 'Moscow', 'Jakarta', 'Rome', 'Paris', 'Budapest', 'Vienna', 'Copenhagen', 'Stockholm', 'Prague',
  'Athens', 'Dublin', 'Brussels', 'Helsinki', 'Lisbon', 'Oslo', 'Warsaw', 'Amsterdam', 'Kiev', 'Bucharest',
  'Minsk', 'Vienna', 'Sofia', 'Bratislava', 'Tallinn', 'Riga', 'Vilnius', 'Luxembourg', 'Reykjavik', 'Tirana',
  'Beirut', 'Jerusalem', 'Amman', 'Riyadh', 'Kuwait City', 'Doha', 'Dubai', 'Muscat', 'Tehran', 'Baghdad',
  'Damascus', 'Cairo', 'Ankara', 'Athens', 'Algiers', 'Rabat', 'Tripoli', 'Tunis', 'Havana', 'Kingston',
  'Ottawa', 'Washington D.C.', 'Panama City', 'Bogota', 'Caracas', 'Lima', 'Santiago', 'Buenos Aires', 'Montevideo', 'Sao Paulo'
];

// Defining GET endpoint for OpenWeather
app.get('/fetch-openweather', async (req, res) => {
    const weatherData = [];

    for (const city of cities) {
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

        try {
            const response = await fetch(url);
            const rawData = await response.json();

            // Finding next index before transforming and saving data
            const lastEntry = await Weather.findOne().sort({ index: -1 });
            const nextIndex = lastEntry ? lastEntry.index + 1 : 1;

            const transformedData = transformOpenWeather(rawData, 2, url, nextIndex);

            // Saving transformed data to MongoDB
            const weatherDocument = new Weather(transformedData);
            await weatherDocument.save();

            weatherData.push(transformedData);
        } catch (error) {
            console.error(`Failed to fetch weather for ${city}:`, error);
            weatherData.push({ city: city, error: error.message, weather: null });
        }
    }

    res.json(weatherData);
});

// Transform function for OpenWeather
function transformOpenWeather(data, apiSource, apiLink, index) {
    return {
        index,
        whichAPI: apiSource,
        linkFromAPI: apiLink,
        city: data.name,
        country: data.sys.country,
        coordinates: {
            latitude: data.coord.lat,
            longitude: data.coord.lon,
        },
        localTime: new Date(data.dt * 1000).toISOString(),
        temperature: {
            celsius: data.main.temp,
            fahrenheit: (data.main.temp * 9/5) + 32, // Converting Celsius to Fahrenheit
        },
        weatherCondition: data.weather[0].main,
        wind: {
            speed_kph: data.wind.speed * 3.6, // Convert m/s to km/h
            speed_mph: data.wind.speed * 2.237, // Convert m/s to mph
            direction: data.wind.deg,
        },
        humidity: data.main.humidity
    };
}

// Defining GET endpoint for WeatherAPI
app.get('/fetch-weatherapi', async (req, res) => {
    const weatherData = [];
    for (const city of cities) {
        const encodedCity = encodeURIComponent(city);
        const url = `http://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_API_KEY}&q=${encodedCity}`;

        try {
            const response = await fetch(url);
            const rawData = await response.json();

            // Finding next index before transforming and saving data
            const lastEntry = await Weather.findOne().sort({ index: -1 });
            const nextIndex = lastEntry ? lastEntry.index + 1 : 1;

            const transformedData = transformWeatherAPI(rawData, 3, url, nextIndex);

            // Saving transformed data to MongoDB
            const weatherDocument = new Weather(transformedData);
            await weatherDocument.save();

            weatherData.push(transformedData);
        } catch (error) {
            console.error(`Failed to fetch weather for ${city}:`, error);
            weatherData.push({ city: city, error: error.message });
        }
    }
    res.json(weatherData);
});

// Transform function for WeatherAPI
function transformWeatherAPI(data, apiSource, apiLink, index) {
    return {
        index,
        whichAPI: apiSource,
        linkFromAPI: apiLink,
        city: data.location.name,
        country: data.location.country,
        coordinates: {
            latitude: data.location.lat,
            longitude: data.location.lon
        },
        localTime: data.location.localtime,
        temperature: {
            celsius: data.current.temp_c,
            fahrenheit: data.current.temp_f
        },
        weatherCondition: data.current.condition.text,
        wind: {
            speed_kph: data.current.wind_kph,
            speed_mph: data.current.wind_mph,
            direction: data.current.wind_dir
        },
        humidity: data.current.humidity
    };
}

// POST for determining which API to get data from
app.post('/fetchAndSaveWeather', async (req, res) => {
    const { city, apiSource } = req.body; // Expecting city name and API source in request body

    let url, transformFunction, cityName, countryName;

    try {
        switch(apiSource) {
            case '1': // AccuWeather
                // Getting location key for city
                const searchUrl = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${ACCUWEATHER_API_KEY}&q=${encodeURIComponent(city)}`;
                const searchResponse = await fetch(searchUrl);
                if (!searchResponse.ok) throw new Error(`Failed to fetch location key for ${city}`);
                const locationData = await searchResponse.json();
            
                // Assuming first result is correct city
                const locationKey = locationData[0]?.Key;
                cityName = locationData[0]?.LocalizedName; // Getting city name
                countryName = locationData[0]?.Country.EnglishName; // Getting country name
                if (!locationKey) throw new Error(`Location key not found for ${city}`);
            
                // Step 2: Use the location key to get the current weather conditions
                url = `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${ACCUWEATHER_API_KEY}`;
                transformFunction = async (rawData, apiSource, apiLink, index) => 
                    transformAccuWeatherSpecific(rawData, apiSource, apiLink, index, cityName, countryName);
                break;
            
            case '2': // OpenWeather
                url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
                transformFunction = transformOpenWeather;
                break;
            
            case '3': // WeatherAPI
                url = `http://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_API_KEY}&q=${encodeURIComponent(city)}`;
                transformFunction = transformWeatherAPI;
                break;
            
            default:
                return res.status(400).send('Invalid API source.');
        }

        // Fetching weather data
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch weather data from API ${apiSource}`);
        const rawData = await response.json();

        // Transforming data
        const lastEntry = await Weather.findOne().sort({ index: -1 });
        const nextIndex = lastEntry ? lastEntry.index + 1 : 1;
        const transformedData = await transformFunction(rawData, apiSource, url, nextIndex);

        // Saving transformed data
        const weatherDocument = new Weather(transformedData);
        await weatherDocument.save();

        res.json(weatherDocument);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
});

// GET for AccuWeather when getting one specific city
app.get('/fetch-accuweather-specific', async (req, res) => {
    const { city } = req.query;

    if (!city) {
        return res.status(400).send('Please provide a city name');
    }

    try {
        // Getting location key for city
        const searchUrl = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${ACCUWEATHER_API_KEY}&q=${encodeURIComponent(city)}`;
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error(`Failed to fetch location key for ${city}`);
        const locationData = await searchResponse.json();

        if (locationData.length === 0) {
            return res.status(404).send(`City not found: ${city}`);
        }

        // Assuming first result is corrrect city
        const locationKey = locationData[0].Key;
        const cityName = locationData[0].LocalizedName;
        const countryName = locationData[0].Country.EnglishName;

        // Using location key to get current weather conditions
        const conditionsUrl = `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${ACCUWEATHER_API_KEY}`;
        const conditionsResponse = await fetch(conditionsUrl);
        if (!conditionsResponse.ok) throw new Error(`Failed to fetch weather conditions for ${city}`);
        const conditionsData = await conditionsResponse.json();

        if (conditionsData.length === 0) {
            return res.status(404).send(`Weather conditions not found for ${city}`);
        }

        const lastEntry = await Weather.findOne().sort({ index: -1 });
        const nextIndex = lastEntry ? lastEntry.index + 1 : 1;

        const transformedData = transformAccuWeatherSpecific(conditionsData[0], '1', conditionsUrl, nextIndex, cityName, countryName);

        // Saving transformed data to database
        const weatherDocument = new Weather(transformedData);
        await weatherDocument.save();

        res.json(weatherDocument);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
});

// Transform function for AccuWeather when getting one city
function transformAccuWeatherSpecific(data, apiSource, apiLink, index, city, country) {
    // Default values for missing data
    const defaultCoordinates = { latitude: 0, longitude: 0 };
    const defaultWind = { speed_kph: 0, speed_mph: 0, direction: 'N/A' };

    const condition = data[0] || {};
    const temperatureMetric = condition.Temperature?.Metric?.Value || 0;
    const temperatureImperial = condition.Temperature?.Imperial?.Value || 0;

    return {
        index,
        whichAPI: Number(apiSource),
        linkFromAPI: apiLink,
        city,
        country,
        coordinates: defaultCoordinates,
        localTime: condition.LocalObservationDateTime,
        temperature: {
            celsius: temperatureMetric,
            fahrenheit: temperatureImperial
        },
        weatherCondition: condition.WeatherText || 'N/A',
        wind: defaultWind,
        humidity: condition.RelativeHumidity || 0
    };
}

// FRONTEND INTERACTABLE ENDPOINTS:

// GET for all weather data
app.get('/weatherData', async (req, res) => {
    try {
        const weatherEntries = await Weather.find({}); // Wanting all fields
        res.json(weatherEntries);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send(error.message);
    }
});

// GET for specific weather data by index
app.get('/weatherData/:index', async (req, res) => {
    try {
        // Parsing index from request parameters
        const index = parseInt(req.params.index);
        if (isNaN(index)) { // Check if the parsed index is a valid number
            return res.status(400).send('Invalid index provided.');
        }

        // Finding weather entry by index
        const weatherEntry = await Weather.findOne({ index: index });
        if (!weatherEntry) {
            return res.status(404).send('Weather data not found');
        }

        res.json(weatherEntry);
    } catch (error) {
        console.error('Error fetching weather data by index:', error);
        res.status(500).send('An error occurred while fetching weather data.');
    }
});

// POST for new weather data
app.post('/weatherData', async (req, res) => {
    try {
        const { whichAPI, linkFromAPI, city, country, coordinates, localTime, temperature, weatherCondition, wind, humidity } = req.body;

        // Finding highest index and adding 1 to determine next index
        const lastEntry = await Weather.findOne().sort({ index: -1 });
        const nextIndex = lastEntry ? lastEntry.index + 1 : 1;

        // Creating new weather data entry
        const newWeatherData = new Weather({
            nextIndex,
            whichAPI,
            linkFromAPI,
            city,
            country,
            coordinates,
            localTime,
            temperature,
            weatherCondition,
            wind,
            humidity
        });

        await newWeatherData.save();
        res.status(201).json(newWeatherData);
    } catch (error) {
        console.error('Error saving weather data:', error);
        res.status(500).json({
            message: 'Error saving data',
            error: error.message
        });
    }
});

// Disallow POST on /weatherData/:index
app.post('/weatherData/:index', (req, res) => {
    res.status(400).send('POST request not allowed on /weatherData/:index');
});

// PUT for updating all weather data entries
app.put('/weatherData', async (req, res) => {
    try {
        await Weather.updateMany({}, {
            $set: req.body
        });
        res.send('All weather data updated.');
    } catch (error) {
        res.status(500).send('Error updating weather data: ' + error.message);
    }
});

// PUT for updating specific weather data by index
app.put('/weatherData/:index', async (req, res) => {
    try {
        // Parsing index from request parameters
        const index = parseInt(req.params.index);
        if (isNaN(index)) { // Checking if valid number
            return res.status(400).send('Invalid index provided.');
        }

        // Findinf weather entry by index and updating it
        const weatherUpdate = await Weather.findOneAndUpdate({ index: index }, {
            $set: req.body
        }, {
            new: true,
            runValidators: true
        });

        if (!weatherUpdate) {
            return res.status(404).send('No weather data found with that index.');
        }

        res.json(weatherUpdate);
    } catch (error) {
        console.error('Error updating weather data by index:', error);
        res.status(500).send('Error updating weather data: ' + error.message);
    }
});

// DELETE for all weather data
app.delete('/weatherData', async (req, res) => {
    try {
        await Weather.deleteMany({});
        res.send('All weather data deleted successfully!');
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting weather data',
            error: error.message
        });
    }
});

// DELETE for specific weather data by index
app.delete('/weatherData/:index', async (req, res) => {
    try {
        // Parsing index from request parameters
        const index = parseInt(req.params.index);
        if (isNaN(index)) { // Checking if parsed index is valid number
            return res.status(400).send('Invalid index provided.');
        }

        // Finding weather entry by custom index and deleting it
        const deletionResult = await Weather.findOneAndDelete({ index: index });

        if (!deletionResult) {
            return res.status(404).send('Weather data not found or already deleted.');
        }

        res.send('Weather data deleted successfully!');
    } catch (error) {
        console.error('Error deleting weather data by index:', error);
        res.status(500).json({
            message: 'Error deleting weather data',
            error: error.message
        });
    }
});

// LAB 5:

// GET for all
app.get('/db', async (req, res) => {
    try {
        const stocks = await Stock.find({}); // Wanting all fields

        // Mapping through all stocks and checking for validity
        const validStocks = stocks.filter(stock => {
            // Checking if all required fields present and not null
            const requiredFields = ['index', 'symbol', 'name', 'sector', 'lastPrice', 'marketCap', 'date', 'time'];
            return requiredFields.every(field => stock[field] != null);
        });

        res.json(validStocks); // Sending only valid stocks
    } catch (error) {
        console.error('Error fetching stocks:', error);
        res.status(500).send(error.message);
    }
});

// GET for index number
app.get('/db/:number', async (req, res) => {
    try {
        // Converting number parameter to number type
        const index = parseInt(req.params.number);
        const stock = await Stock.findOne({
            index: index
        });
        if (!stock) {
            return res.status(404).send('Document not found');
        }
        res.json(stock);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST for all
app.post('/db', async (req, res) => {
    try {
        // Finding last stock entry for determining next index
        const lastStock = await Stock.findOne().sort({
            index: -1
        });
        const nextIndex = lastStock ? lastStock.index + 1 : 1; // Starting from 1 if no stock

        // Creating new stock with next index and data from request body
        const newStock = new Stock({
            index: nextIndex,
            symbol: "AAPL",
            name: "Apple Inc.",
            sector: "Technology",
            marketCap: 2400000000000,
            ...req.body, // Operator to include lastPrice, date, and time from request body
        });

        await newStock.save();
        res.status(201).json(newStock);
    } catch (error) {
        res.status(500).json({
            message: 'Error saving data',
            error: error.message
        });
    }
});

// ERROR for POST on /db/:number
app.post('/db/:number', (req, res) => {
    res.status(400).send('POST request not allowed on /db/:number');
});

// PUT for all
app.put('/db', async (req, res) => {
    try {
        await Stock.updateMany({}, {
            $set: req.body
        });
        res.send('All stocks updated.');
    } catch (error) {
        res.status(500).send('Error updating stocks: ' + error.message);
    }
});

// PUT for index number
app.put('/db/:number', async (req, res) => {
    try {
        const indexToUpdate = parseInt(req.params.number);
        const stockUpdate = await Stock.findOneAndUpdate({
            index: indexToUpdate
        }, {
            $set: req.body
        }, {
            new: true,
            runValidators: true
        });

        if (!stockUpdate) {
            return res.status(404).send('No stock found with that index.');
        }

        res.json(stockUpdate);
    } catch (error) {
        res.status(500).send('Error updating stock: ' + error.message);
    }
});

// DELETE for all
app.delete('/db', async (req, res) => {
    try {
        await Stock.deleteMany({});
        res.send('All documents deleted successfully!');
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting documents',
            error: error.message
        });
    }
});

// DELETE for index number
app.delete('/db/:number', async (req, res) => {
    try {
        const indexToDelete = parseInt(req.params.number);
        await Stock.deleteOne({
            index: indexToDelete
        });
        res.send(`Document with index ${indexToDelete} deleted successfully!`);
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting document',
            error: error.message
        });
    }
});

// LAB 4 AND BEFORE:

// Default data GET
app.get('/stock/:id', (req, res) => {
    const headers = {
        'Authorization': 'Bearer Y1V0WVZJV3VSdjB6QUZmQjU3cnA1TmhDZWJ2QjBnQ1pOVDVCOWcySkNFND0'
    };

    var stockURL = 'https://api.marketdata.app/v1/stocks/quotes/' + req.params.id + '/';
    var moneyURL = 'https://api.frankfurter.app/latest?from=USD';

    fetch(stockURL, {
            headers: headers
        })
        .then(stockResp => {
            if (!stockResp.ok) {
                res.status(stockResp.status);
                return stockResp.json();
            }
            return stockResp.json();
        })
        .then(stockData => {
            if (!stockData || !stockData.last) {
                throw new Error('Invalid stock data received');
            }
            var lastStockJSON = {
                "last": stockData.last[0]
            };
            return fetch(moneyURL).then(moneyResp => {
                    if (!moneyResp.ok) {
                        throw new Error('Currency fetch failed');
                    }
                    return moneyResp.json();
                })
                .then(moneyJSON => ({
                    lastStockJSON,
                    moneyJSON
                }));
        })
        .then(({
            lastStockJSON,
            moneyJSON
        }) => {
            if (req.query.c && moneyJSON.rates[req.query.c]) {
                const specificCurrency = {
                    [req.query.c]: moneyJSON.rates[req.query.c]
                };
                res.json(Object.assign(lastStockJSON, specificCurrency));
            } else {
                res.json(Object.assign(lastStockJSON, moneyJSON.rates));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({
                'message': error.message
            });
        });
});

// "Mid" - Many are showing up as null
app.get('/mid/:id', (req, res) => {
    const headers = {
        'Authorization': 'Bearer Y1V0WVZJV3VSdjB6QUZmQjU3cnA1TmhDZWJ2QjBnQ1pOVDVCOWcySkNFND0'
    };

    const stockURL = `https://api.marketdata.app/v1/stocks/quotes/${req.params.id}/`;
    const moneyURL = 'https://api.frankfurter.app/latest?from=USD';

    fetch(stockURL, {
            headers: headers
        })
        .then(stockResp => {
            if (!stockResp.ok) {
                throw new Error(`Stock fetch failed with status: ${stockResp.status}`);
            }
            return stockResp.json();
        })
        .then(stockData => {
            let midValue = stockData.mid ? stockData.mid[0] : "Not available";
            var midStockJSON = {
                "mid": midValue
            };

            return fetch(moneyURL).then(moneyResp => {
                    if (!moneyResp.ok) {
                        throw new Error(`Currency fetch failed with status: ${moneyResp.status}`);
                    }
                    return moneyResp.json();
                })
                .then(moneyJSON => ({
                    midStockJSON,
                    moneyJSON
                }));
        })
        .then(({
            midStockJSON,
            moneyJSON
        }) => {
            // Adding currency conversion to the mid stock JSON if requested
            if (req.query.c && moneyJSON.rates[req.query.c]) {
                const specificCurrency = {
                    [req.query.c]: moneyJSON.rates[req.query.c]
                };
                res.json(Object.assign(midStockJSON, specificCurrency));
            } else {
                res.json(Object.assign(midStockJSON, moneyJSON.rates));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({
                'message': error.message
            });
        });
});

// "Ask"
app.get('/ask/:id', (req, res) => {
    const headers = {
        'Authorization': 'Bearer Y1V0WVZJV3VSdjB6QUZmQjU3cnA1TmhDZWJ2QjBnQ1pOVDVCOWcySkNFND0'
    };

    const stockURL = `https://api.marketdata.app/v1/stocks/quotes/${req.params.id}/`;
    const moneyURL = 'https://api.frankfurter.app/latest?from=USD';

    fetch(stockURL, {
            headers: headers
        })
        .then(stockResp => {
            if (!stockResp.ok) {
                throw new Error(`Stock fetch failed with status: ${stockResp.status}`);
            }
            return stockResp.json();
        })
        .then(stockData => {
            const askValue = stockData.ask && stockData.ask[0] !== null ? stockData.ask[0] : "Not available";
            var askStockJSON = {
                "ask": askValue
            };

            return fetch(moneyURL).then(moneyResp => {
                    if (!moneyResp.ok) {
                        throw new Error(`Currency fetch failed with status: ${moneyResp.status}`);
                    }
                    return moneyResp.json();
                })
                .then(moneyJSON => ({
                    askStockJSON,
                    moneyJSON
                }));
        })
        .then(({
            askStockJSON,
            moneyJSON
        }) => {
            if (req.query.c && moneyJSON.rates[req.query.c]) {
                const specificCurrency = {
                    [req.query.c]: moneyJSON.rates[req.query.c]
                };
                res.json(Object.assign(askStockJSON, specificCurrency));
            } else {
                res.json(Object.assign(askStockJSON, moneyJSON.rates));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({
                'message': error.message
            });
        });
});

// Saving data to file
app.post('/save', (req, res) => {
    // Adding newline in front of JSON string and at the end
    const dataToSave = "\n" + JSON.stringify(req.body) + "\n";

    const savePath = './savedData.json'; // Defining path to file

    console.log(`Saving data to ${savePath}:`, req.body); // Logging data being saved

    // Appending data to file
    fs.appendFile(savePath, dataToSave, (err) => {
        if (err) {
            console.error('Error saving data:', err);
            res.status(500).json({
                message: 'Error saving data'
            });
        } else {
            console.log('Data saved successfully');
            res.json({
                message: 'Data saved successfully'
            });
        }
    });
});

// Editing info in file
app.put('/edit', (req, res) => {
    console.log('Received edit request with data:', req.body);
    const newData = req.body;

    // If newData not array, make it an array
    const newDataArray = Array.isArray(newData) ? newData : [newData];

    const filePath = 'savedData.json';
    const dataToWrite = newDataArray.map(obj => JSON.stringify(obj)).join("\n") + "\n";

    console.log('Writing data to file:', filePath);
    fs.writeFile(filePath, dataToWrite, 'utf8', err => {
        if (err) {
            console.error('Error writing file:', err);
            res.status(500).json({
                message: 'Error writing data',
                error: err.toString()
            });
            return;
        }
        console.log('Data successfully written to file');
        res.json({
            message: 'Data edited successfully'
        });
    });
});

// Retrieving file information
app.get('/getSavedData', (req, res) => {
    fs.readFile('savedData.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({
                message: 'Error reading data',
                error: err.toString()
            });
            return;
        }

        // Splitting file content by newlines and filtering out empty lines
        const lines = data.split('\n').filter(line => line.trim());

        try {
            // Parsing each line as JSON and collecting results
            const dataArray = lines.map(line => JSON.parse(line));
            res.json(dataArray); // Sending array of parsed objects
        } catch (parseError) {
            console.error('Error parsing data:', parseError);
            res.status(500).json({
                message: 'Error parsing data',
                error: parseError.toString()
            });
        }
    });
});

// Deleting everything in file
app.delete('/delete', (req, res) => {
    fs.writeFile('savedData.json', '', err => {
        if (err) {
            console.error('Error clearing file:', err);
            return res.status(500).json({
                message: 'Error deleting data',
                error: err.toString()
            });
        }
        res.json({
            message: 'Data deleted successfully'
        });
    });

});

// Deleting last item in file
app.delete('/deleteLast', (req, res) => {
    const filePath = 'savedData.json';
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({
                message: 'Error reading data',
                error: err.toString()
            });
        }

        let entries = data.trim().split('\n').filter(line => line).map(JSON.parse);
        entries.pop();

        // Converting updated array back to string
        const updatedData = entries.map(entry => JSON.stringify(entry)).join("\n") + "\n";

        // Writing updated data back to the file
        fs.writeFile(filePath, updatedData, 'utf8', err => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({
                    message: 'Error writing data',
                    error: err.toString()
                });
            }
            res.json({
                message: 'Last item deleted successfully'
            });
        });
    });
});

// Retrieving file and displaying to user
app.get('/getHistory', (req, res) => {
    fs.readFile('savedData.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({
                message: 'Error reading history data',
                error: err.toString()
            });
        }
        const history = data.trim().split('\n').filter(line => line).map(line => JSON.parse(line));
        res.json(history);
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'server', 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log('Listening on *:3000');
});