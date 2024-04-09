# ITWS2110-lim31

======================================================

LAB 7: Creating 2 Data Visualizations using D3  - Michelle Li

            Description of Lab: Using the data you’ve collected until now, create at least two interesting visualizations using D3 (or some other visualization tool of your choice).

- URL for [Landing Page for Lab 7 App](http://lim31.eastus.cloudapp.azure.com/)
- URL for [Michelle's GitHub Repository](https://github.com/RPI-ITWS/itws4500-lim31) - private repo

======================================================

## Creativity/Features

- Azure VM link: [http://lim31.eastus.cloudapp.azure.com/](http://lim31.eastus.cloudapp.azure.com/)
- Running on Azure VM (auto shuts off at 4 AM everyday):
1. `ssh lim31@lim31.eastus.cloudapp.azure.com`
2. `cd /var/www/html/iit/labs/lab6`
3. `export MONGODB_URI='mongodb+srv://misherelle:[MY_PASSWORD]@cluster0.vfzaibr.mongodb.net/'`
4. `npm start` (and install anything else as prompted to by the terminal, like concurrently, d3, tippy, etc.)

- Local link: [http://localhost:3000/](http://localhost:3000/)
- Running locally:
1. Run `npm start`

- Lab 7 starts when you select one of the GET button options in the "Weather Ticker" section of the page - the 4 data visualizations should be displayed right above the data and the GET, POST, PUT, and DELETE input fields
- When you hover over over each bar or data point in the visualizations, the information for that data point displays using Tippy.js!

- Default data set (300 documents - 100 per API souce):
1. Run [http://localhost:3000/fetch-accuweather](http://localhost:3000/fetch-accuweather)
2. Run [http://localhost:3000/fetch-openweather](http://localhost:3000/fetch-openweather)
3. Run [http://localhost:3000/fetch-weatherapi](http://localhost:3000/fetch-weatherapi)

- Stock ticker app, with a pixel art plant and nature design theme, displaying stock data and currency conversion information from Market Data, Frankfurter, custom database APIs, as well as 3 weather APIs - with a calming and alluring aesthetic built with the help of Vite
- If mouse hovered over email link in the footer, it will directly allow you to email me
- If mouse hovered over "RPI" link in the footer, it will directly allow you to go to the rpi.edu main webpage
- Clicking the page title and logo will redirect you back to the page
- Green color theme to signify the color of USD bills, as well as using it psychologically as a "feel good" and positively reinforcing color for the users
- Hidden feature: hovering over images of stuffed animal ducks will make the flip horizontally quickly -- as if they're dancing!

======================================================

## Resources

API used on site:
- https://docs.marketdata.app/docs/api - Market Data API documentation and usage about
- https://www.frankfurter.app/docs/ - Frankfurter API documentation and usage about
- https://developer.accuweather.com/apis - AccuWeather API documentation and usage about
- https://openweathermap.org/api - OpenWeather API documentation and usage about
- https://www.weatherapi.com/docs/ - WeatherAPI API documentation and usage about

Lab 6 resources:
- https://www.w3schools.com/html/html_css.asp - CSS syntax guide
- https://jigsaw.w3.org/css-validator/#validate_by_input - CSS Validator
- https://www.freeformatter.com/html-formatter.html#before-output - Code formatter for organization
- https://in.pinterest.com/pin/871094752911771108/ - Website icon image credit
- https://www.hiclipart.com/free-transparent-background-png-clipart-skszr - Flower and succulent image credit
- https://vitejs.dev/ - Vite tool homepage
- https://vitejs.dev/guide/ - Vite tool documentation
- https://legacy.reactjs.org/docs/getting-started.html - React getting started guide
- https://legacy.reactjs.org/docs/introducing-jsx.html - React syntax & JSX info
- https://www.w3schools.com/react/react_jsx.asp - Syntax for React JSX W3Schools
- https://stackoverflow.com/questions/43664200/what-is-the-difference-between-npm-install-and-npm-run-build - npm install vs. npm run build
- https://medium.com/@zahidbashirkhan/whats-the-difference-between-npm-run-dev-npm-run-build-and-npm-run-start-in-next-js-7baf9b7c5d39 - Difference between npm run dev, npm run build, and npm run start
- https://www.mongodb.com/developer/languages/javascript/getting-started-with-mongodb-and-mongoose/ - Getting started with MongoDB and Mongoose guide
- https://cloud.mongodb.com/v2/65f08d6e8d952f688d22d6ad#/overview - MongoDB Atlas
- https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose - Mongoose help
- https://mongoosejs.com/docs/guide.html - Mongoose schemas
- MongoDB Compass for data management
- MongoDB Atlas for managing IP address
- https://www.snowflake.com/guides/etl-pipeline/ - What is ETL pipeline?
- https://www.analyticsvidhya.com/blog/2022/06/a-complete-guide-on-building-an-etl-pipeline-for-beginners/ - Guide on building ETL pipeline
- https://stackoverflow.com/questions/75457018/how-to-perform-multiple-sequential-operations-in-node-js - How to perform multiple sequential operations in Node.js?
- https://atomiks.github.io/tippyjs/ - Tippy.js guide
- https://d3js.org/getting-started - D3.js guide
- https://www.d3indepth.com/ - D3 in depth guide
- https://stackoverflow.com/tags/d3.js/ - Stack Overflow help with D3 questions