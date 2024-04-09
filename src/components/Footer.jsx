import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© 2024 StockView, Market Data API, Frankfurter API, AccuWeather API, WeatherAPI.com, OpenWeather API</p>
        <p>
          <a href="#">Privacy Policy</a>
        </p>
        <p>
          Michelle Li @ <a href="mailto:lim31@rpi.edu">lim31@rpi.edu</a>
        </p>
        <p>
          <a href="https://www.rpi.edu/">Rensselaer Polytechnic Institute</a> | ITWS-4500 Web Science Development
        </p>
      </div>
    </footer>
  );
};

export default Footer;