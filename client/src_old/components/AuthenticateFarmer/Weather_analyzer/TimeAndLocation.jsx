import React from "react";
import { formatToLocalTime } from "./services/weatherService";

function TimeAndLocation({ weather: { dt, timezone, name, country } }) {
  return (
    <div className="weather-time-location">
      <p className="weather-local-time">
        {formatToLocalTime(dt, timezone)}
      </p>
      <h2 className="weather-city-name">{`${name}, ${country}`}</h2>
    </div>
  );
}

export default TimeAndLocation;
