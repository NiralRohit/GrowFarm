import React from "react";
import {
  UilTemperature,
  UilTear,
  UilWind,
  UilSun,
  UilSunset,
} from "@iconscout/react-unicons";
import { formatToLocalTime, iconUrlFromCode } from "./services/weatherService";

function TemperatureAndDetails({
  weather: {
    details,
    icon,
    temp,
    temp_min,
    temp_max,
    sunrise,
    sunset,
    speed,
    humidity,
    feels_like,
    timezone,
  },
  units,
}) {
  const unitSymbol = units === "metric" ? "°C" : "°F";
  return (
    <div>
      <p className="weather-condition-text">{details}</p>

      <div className="weather-main-info">
        <img
          src={iconUrlFromCode(icon)}
          alt={details}
          className="weather-main-icon"
        />
        <p className="weather-main-temp">{`${temp.toFixed()}${unitSymbol}`}</p>
        <div className="weather-detail-list">
          <div className="weather-detail-item">
            <UilTemperature size={16} />
            Feels like:
            <span className="weather-detail-value">{`${feels_like.toFixed()}${unitSymbol}`}</span>
          </div>
          <div className="weather-detail-item">
            <UilTear size={16} />
            Humidity:
            <span className="weather-detail-value">{`${humidity.toFixed()}%`}</span>
          </div>
          <div className="weather-detail-item">
            <UilWind size={16} />
            Wind:
            <span className="weather-detail-value">{`${speed.toFixed()} km/h`}</span>
          </div>
        </div>
      </div>

      <div className="weather-sun-row">
        <div className="weather-sun-label">
          <UilSun size={18} />
          Rise:
          <span className="weather-sun-value">
            {formatToLocalTime(sunrise, timezone, "hh:mm a")}
          </span>
        </div>
        <span className="weather-sun-divider">|</span>
        <div className="weather-sun-label">
          <UilSunset size={18} />
          Set:
          <span className="weather-sun-value">
            {formatToLocalTime(sunset, timezone, "hh:mm a")}
          </span>
        </div>
        <span className="weather-sun-divider">|</span>
        <div className="weather-sun-label">
          <UilSun size={18} />
          High:
          <span className="weather-sun-value">{`${temp_max.toFixed()}${unitSymbol}`}</span>
        </div>
        <span className="weather-sun-divider">|</span>
        <div className="weather-sun-label">
          <UilSun size={18} />
          Low:
          <span className="weather-sun-value">{`${temp_min.toFixed()}${unitSymbol}`}</span>
        </div>
      </div>
    </div>
  );
}

export default TemperatureAndDetails;
