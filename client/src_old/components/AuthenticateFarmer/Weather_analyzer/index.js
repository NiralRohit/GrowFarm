import TopButtons from "./TopButtons";
import Inputs from "./Inputs";
import TimeAndLocation from "./TimeAndLocation";
import TemperatureAndDetails from "./TemperatureAndDetails";
import Forecast from "./Forecast";
import getFormattedWeatherData from "./services/weatherService";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";

function WeatherAnalyzer() {
  const [query, setQuery] = useState({ q: "Rajkot" });
  const [units, setUnits] = useState("metric");
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const message = query.q ? query.q : "current location.";

      toast.info("Fetching weather for " + message);

      try {
        const data = await getFormattedWeatherData({ ...query, units });
        toast.success(
          `Successfully fetched weather for ${data.name}, ${data.country}.`
        );
        console.log(data);
        setWeather(data);
      } catch (err) {
        console.error("Weather fetch error:", err);
        toast.error("Failed to fetch weather data. Please try again.");
      }
    };

    fetchWeather();
  }, [query, units]);

  const isWarm = () => {
    if (!weather) return false;
    const threshold = units === "metric" ? 30 : 86;
    return weather.temp > threshold;
  };

  return (
    <div className={`weather-container ${isWarm() ? "warm" : ""}`}>
      <TopButtons setQuery={setQuery} />
      <Inputs setQuery={setQuery} units={units} setUnits={setUnits} />

      {weather ? (
        <div>
          <TimeAndLocation weather={weather} />
          <TemperatureAndDetails weather={weather} units={units} />

          <Forecast title="hourly forecast" items={weather.hourly} units={units} />
          <Forecast title="daily forecast" items={weather.daily} units={units} />
        </div>
      ) : (
        <div className="weather-loading">
          <div className="weather-loading-spinner"></div>
          <p>Loading weather data...</p>
        </div>
      )}

      <ToastContainer autoClose={3000} theme="colored" newestOnTop={true} />
    </div>
  );
}

export default WeatherAnalyzer;
