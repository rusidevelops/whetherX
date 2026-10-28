async function getWeather(event) {
  if (event) event.preventDefault(); // Stops the form from reloading the page

  const city = document.getElementById("cityInput").value.trim();
  const resultDiv = document.getElementById("weatherResult");

  if (!city) {
    resultDiv.innerHTML = "<p>Please enter a city.</p>";
    return;
  }

  // Check localStorage cache
  const cacheKey = "weather_" + city.toLowerCase();
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minutes cache
      displayWeather(data);
      return;
    }
  }

  try {
    // Step 1: Get coordinates from city name
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoRes.json();

    if (!geoData.results) throw new Error("City not found");

    const { latitude, longitude, name, country } = geoData.results[0];

    // Step 2: Get weather using coordinates
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherRes.json();

    const weather = {
      name,
      country,
      temperature: weatherData.current_weather.temperature,
      windspeed: weatherData.current_weather.windspeed,
      weathercode: weatherData.current_weather.weathercode
    };

    // Save to cache
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data: weather
    }));

    displayWeather(weather);

  } catch (error) {
    resultDiv.innerHTML = `<p>${error.message}</p>`;
  }
}

function displayWeather(weather) {
  const resultDiv = document.getElementById("weatherResult");
  resultDiv.innerHTML = `
    <h3>${weather.name}, ${weather.country}</h3>
    <div class="temp">${weather.temperature}°C</div>
    <p>Wind Speed: ${weather.windspeed} km/h</p>
    <p>Weather Code: ${weather.weathercode}</p>
  `;
}

   document.getElementById("cityInput").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    getWeather();
  }
});