import React from "react";
import "./style.css";

function TopButtons({ setQuery }) {
  const cities = [
    { id: 1, title: "Surat" },
    { id: 2, title: "Ahmedabad" },
    { id: 3, title: "Gandhinagar" },
    { id: 4, title: "Baroda" },
    { id: 5, title: "Rajkot" },
  ];

  return (
    <div className="weather-top-buttons">
      {cities.map((city) => (
        <button
          key={city.id}
          className="weather-city-btn"
          onClick={() => setQuery({ q: city.title })}
        >
          {city.title}
        </button>
      ))}
    </div>
  );
}

export default TopButtons;
