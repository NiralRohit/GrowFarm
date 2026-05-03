import { DateTime } from "luxon";

const API_KEY = "1fa9ff4126d95b8db54f3897a208e91c";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const getWeatherData = (infoType, searchParams) => {
  const url = new URL(BASE_URL + "/" + infoType);
  url.search = new URLSearchParams({ ...searchParams, appid: API_KEY });

  return fetch(url).then((res) => res.json());
};

const formatCurrentWeather = (data) => {
  const {
    coord: { lat, lon },
    main: { temp, feels_like, temp_min, temp_max, humidity },
    name,
    dt,
    sys: { country, sunrise, sunset },
    weather,
    wind: { speed },
    timezone: timezoneOffset,
  } = data;

  const { main: details, icon } = weather[0];

  // Convert offset (seconds) to an IANA-like timezone string for luxon
  const hours = Math.floor(Math.abs(timezoneOffset) / 3600);
  const mins = Math.floor((Math.abs(timezoneOffset) % 3600) / 60);
  const sign = timezoneOffset >= 0 ? "+" : "-";
  const timezone = `UTC${sign}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

  return {
    lat,
    lon,
    temp,
    feels_like,
    temp_min,
    temp_max,
    humidity,
    name,
    dt,
    country,
    sunrise,
    sunset,
    details,
    icon,
    speed,
    timezone,
  };
};

const formatForecastWeather = (data, timezone) => {
  const list = data.list || [];

  // Hourly forecast: take the next 5 entries (every 3 hours)
  const hourly = list.slice(0, 5).map((d) => {
    return {
      title: formatToLocalTime(d.dt, timezone, "hh:mm a"),
      temp: d.main.temp,
      icon: d.weather[0].icon,
    };
  });

  // Daily forecast: group by day and pick one entry per day (around noon)
  const dailyMap = {};
  list.forEach((d) => {
    const day = formatToLocalTime(d.dt, timezone, "yyyy-MM-dd");
    const hour = DateTime.fromSeconds(d.dt).setZone(timezone).hour;
    // Prefer entries around noon (12:00)
    if (!dailyMap[day] || Math.abs(hour - 12) < Math.abs(dailyMap[day].hour - 12)) {
      dailyMap[day] = { ...d, hour };
    }
  });

  const daily = Object.values(dailyMap).slice(1, 6).map((d) => {
    return {
      title: formatToLocalTime(d.dt, timezone, "ccc"),
      temp: d.main.temp,
      icon: d.weather[0].icon,
    };
  });

  return { timezone, daily, hourly };
};

const getFormattedWeatherData = async (searchParams) => {
  const formattedCurrentWeather = await getWeatherData(
    "weather",
    searchParams
  ).then(formatCurrentWeather);

  const { lat, lon, timezone } = formattedCurrentWeather;

  // Use free 'forecast' endpoint instead of paid 'onecall'
  const formattedForecastWeather = await getWeatherData("forecast", {
    lat,
    lon,
    units: searchParams.units,
  }).then((data) => formatForecastWeather(data, timezone));

  return { ...formattedCurrentWeather, ...formattedForecastWeather };
};

const formatToLocalTime = (
  secs,
  zone,
  format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a"
) => DateTime.fromSeconds(secs).setZone(zone).toFormat(format);

const iconUrlFromCode = (code) =>
  `http://openweathermap.org/img/wn/${code}@2x.png`;

export default getFormattedWeatherData;

export { formatToLocalTime, iconUrlFromCode };
