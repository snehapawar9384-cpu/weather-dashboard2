


const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");

const currentWeather = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecastSection");

const weatherIcons = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "❄️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️"
};

function getIcon(code) {
  return weatherIcons[code] || "🌡️";
}

function getDescription(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return "Rain";
  }
  if ([71, 73, 75].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Weather update";
}

async function searchWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    message.textContent = "Please enter a city name.";
    return;
  }

  message.textContent = "Loading weather...";
  currentWeather.hidden = true;
  forecastSection.hidden = true;
  searchBtn.disabled = true;

  try {
    // Find the city's latitude and longitude
    const geoURL =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoURL);

    if (!geoResponse.ok) throw new Error("Could not find the city.");

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please check the spelling.");
    }

    const place = geoData.results[0];
    const { latitude, longitude, name, country } = place;

    // Fetch current weather and five-day forecast
    const weatherURL =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

    const weatherResponse = await fetch(weatherURL);

    if (!weatherResponse.ok) {
  const errorText = await weatherResponse.text();
  throw new Error("Weather API Error: " + errorText);
}

    const data = await weatherResponse.json();
    const current = data.current;
    const daily = data.daily;

    document.getElementById("cityName").textContent =
      `${name}, ${country}`;

    document.getElementById("weatherIcon").textContent =
      getIcon(current.weather_code);

    document.getElementById("temperature").textContent =
      `${Math.round(current.temperature_2m)}°C`;

    document.getElementById("description").textContent =
      getDescription(current.weather_code);

    document.getElementById("details").textContent =
      `Feels like ${Math.round(current.apparent_temperature)}°C · Humidity ${current.relative_humidity_2m}% · Wind ${current.wind_speed_10m} km/h`;

    const forecast = document.getElementById("forecast");
    forecast.replaceChildren();

    daily.time.forEach((date, index) => {
      const card = document.createElement("div");
      card.className = "forecast-card";

      const day = new Date(`${date}T12:00:00`)
        .toLocaleDateString("en-IN", { weekday: "short" });

      const dayLabel = document.createElement("p");
      dayLabel.textContent = day;

      const icon = document.createElement("div");
      icon.className = "icon";
      icon.textContent = getIcon(daily.weather_code[index]);

      const description = document.createElement("p");
      description.textContent = getDescription(daily.weather_code[index]);

      const temperatures = document.createElement("p");
      temperatures.textContent =
        `${Math.round(daily.temperature_2m_max[index])}° / ${Math.round(daily.temperature_2m_min[index])}°`;

      card.append(dayLabel, icon, description, temperatures);
      forecast.appendChild(card);
    });

    currentWeather.hidden = false;
    forecastSection.hidden = false;
    message.textContent = "";

  } catch (error) {
    message.textContent =
      error.message || "Unable to load weather. Please try again.";
  } finally {
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchWeather();
});
