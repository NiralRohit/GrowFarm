import React from "react";
import { iconUrlFromCode } from "./services/weatherService";

function Forecast({ title, items, units }) {
  const unitSymbol = units === "metric" ? "°C" : "°F";
  return (
    <div className="weather-forecast-section">
      <p className="weather-forecast-title">{title}</p>
      <hr className="weather-forecast-divider" />

      <div className="weather-forecast-row">
        {items.map((item, index) => (
          <div key={index} className="weather-forecast-card">
            <p className="weather-forecast-time">{item.title}</p>
            <img
              src={iconUrlFromCode(item.icon)}
              className="weather-forecast-icon"
              alt=""
            />
            <p className="weather-forecast-temp">{`${item.temp.toFixed()}${unitSymbol}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Forecast;
