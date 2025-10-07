/* =========================
   ENHANCED WEATHER APP JS
   ========================= */

// ----------------- API KEY -----------------
const API_KEY = '2a71edeb23998fc9993380115e85d598'; 

// ----------------- DOM ELEMENTS -----------------
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherDisplay = document.getElementById('weather-display');
const forecastContainer = document.getElementById('forecast');
const forecastCards = document.getElementById('forecast-cards');
const historyList = document.getElementById('history-list');
const toggleUnitBtn = document.getElementById('toggle-unit');

let currentUnit = 'metric'; // 'metric' = Celsius, 'imperial' = Fahrenheit
let searchHistory = [];     // Stores last 5 searched cities

// ----------------- LOCAL STORAGE -----------------
function loadHistory() {
  const savedHistory = localStorage.getItem('searchHistory');
  if (savedHistory) searchHistory = JSON.parse(savedHistory);
  renderHistory();
}

function saveHistory() {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

// Render search history list
function renderHistory() {
  historyList.innerHTML = '';
  searchHistory.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city;
    li.addEventListener('click', () => fetchWeather(city));
    historyList.appendChild(li);
  });
}

// ----------------- WEATHER FETCH -----------------
async function fetchWeather(city) {
  if (!city) return;

  loading.classList.remove('hidden');
  error.classList.add('hidden');
  weatherDisplay.classList.add('hidden');
  forecastContainer.classList.add('hidden');

  try {
    // Fetch current weather
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`
    );
    if (!weatherRes.ok) throw new Error('City not found');
    const weatherData = await weatherRes.json();
    displayCurrentWeather(weatherData);

    // Fetch 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`
    );
    const forecastData = await forecastRes.json();
    displayForecast(forecastData);

    // Update search history
    updateHistory(city);
  } catch (err) {
    showError(err.message);
  } finally {
    loading.classList.add('hidden');
  }
}

// ----------------- CURRENT WEATHER DISPLAY -----------------
function displayCurrentWeather(data) {
  document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('temp').textContent = Math.round(data.main.temp);
  document.getElementById('feels-like').textContent = Math.round(data.main.feels_like);
  document.getElementById('humidity').textContent = data.main.humidity;
  document.getElementById('wind').textContent = data.wind.speed;
  document.getElementById('description').textContent = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherDisplay.classList.remove('hidden');
}

// ----------------- FORECAST DISPLAY -----------------
function displayForecast(data) {
  forecastCards.innerHTML = '';
  forecastContainer.classList.remove('hidden');

  // Filter for one forecast per day at 12:00
  const dailyForecast = data.list.filter(f => f.dt_txt.includes("12:00:00"));

  dailyForecast.forEach(f => {
    const card = document.createElement('div');
    card.classList.add('forecast-card');
    card.innerHTML = `
      <p>${new Date(f.dt_txt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
      <img src="https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png" alt="Icon">
      <p>${Math.round(f.main.temp)}°</p>
    `;
    forecastCards.appendChild(card);
  });
}

// ----------------- SEARCH HISTORY -----------------
function updateHistory(city) {
  // Avoid duplicates
  searchHistory = searchHistory.filter(c => c.toLowerCase() !== city.toLowerCase());
  searchHistory.unshift(city); // Add newest first
  if (searchHistory.length > 5) searchHistory.pop(); // Keep only last 5
  saveHistory();
  renderHistory();
}

// ----------------- ERROR DISPLAY -----------------
function showError(message) {
  error.textContent = message;
  error.classList.remove('hidden');
}

// ----------------- UNIT TOGGLE -----------------
toggleUnitBtn.addEventListener('click', () => {
  currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
  const currentCity = document.getElementById('city-name').textContent.split(',')[0];
  if (currentCity) fetchWeather(currentCity);
});

// ----------------- SEARCH BUTTON & ENTER KEY -----------------
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
  else showError('Please enter a city name');
});

cityInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') searchBtn.click();
});

// ----------------- GEOLOCATION -----------------
window.addEventListener('load', () => {
  loadHistory();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`
        );
        const data = await res.json();
        displayCurrentWeather(data);

        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`
        );
        const forecastData = await forecastRes.json();
        displayForecast(forecastData);

        updateHistory(data.name);
      } catch (err) {
        showError('Failed to detect location');
      }
    });
  } else {
    showError('Geolocation not supported by your browser');
  }
});
