import React, { useState } from "react";
import { UilSearch, UilLocationPoint } from "@iconscout/react-unicons";
import { toast } from "react-toastify";

function Inputs({ setQuery, units, setUnits }) {
  const [city, setCity] = useState("");

  const handleUnitsChange = (e) => {
    const selectedUnit = e.currentTarget.name;
    if (units !== selectedUnit) setUnits(selectedUnit);
  };

  const handleSearchClick = () => {
    if (city !== "") setQuery({ q: city });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && city !== "") {
      setQuery({ q: city });
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      toast.info("Fetching your location...");
      navigator.geolocation.getCurrentPosition((position) => {
        toast.success("Location fetched!");
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        setQuery({ lat, lon });
      });
    }
  };

  return (
    <div className="weather-search-row">
      <div className="weather-search-input-wrap">
        <input
          value={city}
          onChange={(e) => setCity(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Search for city..."
          className="weather-search-input"
        />
      </div>
      <button className="weather-icon-btn" onClick={handleSearchClick} title="Search">
        <UilSearch size={20} />
      </button>
      <button className="weather-icon-btn" onClick={handleLocationClick} title="Use my location">
        <UilLocationPoint size={20} />
      </button>
      <div className="weather-unit-toggle">
        <button
          name="metric"
          className={`weather-unit-btn ${units === "metric" ? "active" : ""}`}
          onClick={handleUnitsChange}
        >
          °C
        </button>
        <span className="weather-unit-divider">|</span>
        <button
          name="imperial"
          className={`weather-unit-btn ${units === "imperial" ? "active" : ""}`}
          onClick={handleUnitsChange}
        >
          °F
        </button>
      </div>
    </div>
  );
}

export default Inputs;
