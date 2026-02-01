"use strict";

// ELEMENTS

// Document head
const pageTitleEl = document.querySelector("title");
const pageTitleDefault = pageTitleEl.textContent;

// Header
const unitsNav = document.querySelector("#units-nav");
const unitsBtn = document.querySelector("#units-btn");
const switchUnitsBtn = document.querySelector("#switch-units-btn");
const unitKeyword = document.querySelector("#unit-keyword");
const units = document.querySelector("#units");

// Main content

// Main content header
const mainContentHeaderContainer = document.querySelector("#main-content-header-container");

const searchInputContainer = document.querySelector("#search-input-container");
const searchInputField = document.querySelector("#place");
const searchDropdown = document.querySelector("#search-dropdown");
const searchLoadingBox = document.querySelector("#search-loading-box");
const searchBtn = document.querySelector("#search-btn");

// Main content showcase
const mainContentShowcase = document.querySelector("#main-content-showcase");
const mainContentShowcaseContainer = document.querySelector("#main-content-showcase-container");
const tempLoadingBox = document.querySelector("#temp-loading-box");
const locationEl = document.querySelector("#location");
const dateEl = document.querySelector("#date");
const currentWeatherIcon = document.querySelector("#current-weather-icon");
const currentTemp = document.querySelector("#current-temp");
const apparentTemp = document.querySelector("#apparent-temp");
const relativeHumidity = document.querySelector("#relative-humidity");
const windSpeed = document.querySelector("#wind-speed");
const precipitation = document.querySelector("#precipitation");

const dailyData = document.querySelector("#daily-data");

const daysNav = document.querySelector("#days-nav");
const daysBtn = document.querySelector("#days-btn");
const daysDropdown = document.querySelector("#days-dropdown");

const hourlyData = document.querySelector("#hourly-data");

// Error elements
const APIErrContainer = document.querySelector("#api-err-container");
const retryBtn = document.querySelector("#retry-btn");
const locationErr = document.querySelector("#location-err");

// HELPERS
let isImperial = JSON.parse(localStorage.getItem("isImperial")) || false;

let places = new Set(JSON.parse(localStorage.getItem("places")) || []);

let targetPlace;

let notFound;
let placeForecastResponse;
let placeForecastData;

let hourCount;

// Format today's date
const dateToday = new Date();
const dateTodayFormat = `${dateToday.toLocaleDateString("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  year: "numeric"
})}`;

const UNITS_MAP = {
  speed: {
    "km/h": "km/h",
    "mp/h": "mph"
  },
  precipitation: {
    mm: "mm",
    inch: "in"
  }
};

// FUNCTIONS

// Get user's current position
function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, function (err) {
        notFound = true;

        reject(err);
      }, {
        timeout: 10000
      }
    );
  });
}

// Change document title
function changePageTitle(word) {
  const appName = pageTitleDefault.split(" | ").at(-1);

  pageTitleEl.textContent = `${word} | ${appName}`;
}

// Set default document title
const setDefaultPageTitle = () => pageTitleEl.textContent = pageTitleDefault;

// Convert Celsius to Fahrenheit and vice versa
const convertTemp = (value, toImperial) => Math.round(toImperial ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9);

// Convert km/h to mph and vice versa
const convertSpeed = (value, toImperial) => Math.round(toImperial ? value * 0.621371 : value * 1.60934);

// Convert mm to in (inches) and vice versa
const convertPrecipitation = (value, toImperial) => (toImperial ? value * 0.0393701 : value * 25.4).toFixed(1);

// Extract numeric value from a formatted string (e.g. "2 km/h", "2°")
function parseValue(str) {
  const match = str.match(/(-?\d+(?:\.\d+)?)\s*([^\d\s]+)/);

  if (!match) return null;

  return Number(match[1]);
}

// Render search history
function renderSearchDropdown() {
  searchDropdown.classList.remove("overflow-y-scroll");

  searchDropdown.innerHTML = [...places].map(function (place) {
    return `
      <button class="text-left font-medium text-base leading-tighter capitalize py-2.5 pl-2 pr-9 hover:bg-neutral-700 hover:shadow-ui rounded-lg outline outline-1 outline-transparent focus:outline-white focus:outline-offset-1 transition-all duration-150 shadow-[0_0_0_0.0625rem_transparent] focus:shadow-neutral-900 relative group">
        ${place}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-75 transition-all duration-150" viewBox="0 0 512 512">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144M368 144L144 368" />
        </svg>
      </button>
    `;
  }).join("");

  if (places.size > 4) searchDropdown.classList.add("overflow-y-scroll");
}

// Show/hide element
function toggleVisibility(el, state) {
  el.classList.toggle("flex", state);
  el.classList.toggle("hidden", !state);
}

const toggleHiddenClass = (el, state) => el.classList.toggle("hidden", state);

// Get weather icon data (src or alt text) from weather code
function getWeatherIconData(weatherCode) {
  switch (weatherCode) {
    case 0:
    case 1:
      return {
        src: "./assets/images/weather_icons/icon-sunny.webp",
        alt: "Sun icon"
      };

    case 2:
      return {
        src: "./assets/images/weather_icons/icon-partly-cloudy.webp",
        alt: "Partly cloudy icon"
      };

    case 3:
      return {
        src: "./assets/images/weather_icons/icon-overcast.webp",
        alt: "Overcast icon"
      };

    case 45:
    case 48:
      return {
        src: "./assets/images/weather_icons/icon-fog.webp",
        alt: "Fog icon"
      };

    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return {
        src: "./assets/images/weather_icons/icon-drizzle.webp",
        alt: "Drizzle icon"
      };

    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return {
        src: "./assets/images/weather_icons/icon-rain.webp",
        alt: "Rain icon"
      };

    case 71:
    case 73:
    case 75:
    case 77:
    case 67:
    case 85:
    case 86:
      return {
        src: "./assets/images/weather_icons/icon-snow.webp",
        alt: "Snow icon"
      };

    case 95:
    case 96:
    case 99:
      return {
        src: "./assets/images/weather_icons/icon-storm.webp",
        alt: "Thunderstorm icon"
      };

    default:
      return {
        src: "",
        alt: "Image not found"
      };
  }
}

// Convert hourly temperature
function convertHourlyTemp(value, APIUnit, targetUnit) {
  if (APIUnit === targetUnit) return value;

  return targetUnit === "F" ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
}

// Get error message
function getErrMessage(err) {
  // Geolocation-specific errors
  if (err && typeof err.code === "number") {
    if (err.code === 1) return "Location access denied."; // User blocked location access
    if (err.code === 2) return "Location unavailable."; // GPS/position unavailable
    if (err.code === 3) return "Unable to get your location."; // Timeout while fetching location
  }

  // Offline scenario (no internet connection)
  if (!navigator.onLine) return "We couldn't connect to the server (API error)";

  // Default: return the error's original message
  return err.message;
}

// Show error
function displayErr(notFound, msg) {
  // Display error in main content showcase
  if (notFound) {
    locationErr.textContent = msg;

    toggleHiddenClass(mainContentShowcase, false);
    toggleHiddenClass(locationErr, false);
    toggleHiddenClass(mainContentShowcaseContainer, true);

    return;
  }

  // Display error in the main content header
  toggleHiddenClass(mainContentHeaderContainer, true);
  toggleHiddenClass(mainContentShowcase, true);

  toggleVisibility(APIErrContainer, true);

  APIErrContainer.querySelector("#api-err").textContent = msg;
}

// Display UI
function displayUI() {
  toggleHiddenClass(mainContentShowcase, false);
  toggleHiddenClass(mainContentShowcaseContainer, false);
  toggleHiddenClass(locationErr, true);
}

// Render single hourly forecast item
function renderHourlyItem(element, value, index) {
  // Format hour
  const hourNumber = placeForecastData.hourly.time[index].split("T")[1].slice(0, 2);
  const period = hourNumber >= 12 ? "pm" : "am";

  if (hourNumber > 12) hourCount++;

  const hourFormatted = (hourNumber === "00" && "12") || (hourNumber > 12 && hourCount) || (hourNumber.startsWith("0") && hourNumber.slice(1)) || hourNumber;

  const hour = `${hourFormatted} ${period}`;

  // Render and set values to the element
  element.innerHTML = `
    <img src="${getWeatherIconData(placeForecastData.hourly.weather_code[index]).src}" alt="${getWeatherIconData(placeForecastData.hourly.weather_code[index]).alt}" class="h-10" />
    <span id="hour" class="font-medium text-xl leading-tighter uppercase flex-grow">${hour}</span>
    <span id="hourly-temp" class="font-medium text-base leading-tighter">${Math.round(value)}${placeForecastData.hourly_units.temperature_2m.slice(0, 1)}</span>
  `;
}

// Update UI
function updateUI(place, country) {
  // Hide temperature loading box
  toggleVisibility(tempLoadingBox, false);

  // Change document title to the selected place and its country
  changePageTitle(`${place}, ${country}`);

  locationEl.textContent = `${place}, ${country}`;
  dateEl.textContent = dateTodayFormat;

  // Set weather icon
  currentWeatherIcon.src = getWeatherIconData(placeForecastData.current.weather_code).src;
  currentWeatherIcon.alt = getWeatherIconData(placeForecastData.current.weather_code).alt;

  // Set current weather data
  currentTemp.textContent = `${Math.round(placeForecastData.current.temperature_2m)}${placeForecastData.current_units.temperature_2m.slice(0, 1)}`;
  apparentTemp.textContent = `${Math.round(placeForecastData.current.apparent_temperature)}${placeForecastData.current_units.apparent_temperature.slice(0, 1)}`;
  relativeHumidity.textContent = `${placeForecastData.current.relative_humidity_2m}%`;
  windSpeed.textContent = `${Math.round(placeForecastData.current.wind_speed_10m)} ${UNITS_MAP.speed[placeForecastData.current_units.wind_speed_10m]}`;
  precipitation.textContent = `${placeForecastData.current.precipitation.toFixed(1)} ${UNITS_MAP.precipitation[placeForecastData.current_units.precipitation]}`;

  // Render and set daily weather data
  dailyData.querySelectorAll("li").forEach(function (el, i) {
    el.innerHTML = `
		  <span class="font-medium text-lg leading-tighter capitalize">${new Date(placeForecastData.daily.time[i]).toLocaleDateString("en-US", { weekday: "short" })}</span>
		  <img src="${getWeatherIconData(placeForecastData.daily.weather_code[i]).src}" alt="${getWeatherIconData(placeForecastData.daily.weather_code[i]).alt}" class="max-h-15" />
		  <div class="font-medium text-base leading-tighter flex items-center justify-between gap-4 self-stretch">
			  <span id="max-temp">${Math.round(placeForecastData.daily.temperature_2m_max[i])}${placeForecastData.daily_units.temperature_2m_max.slice(0, 1)}</span>
			  <span id="min-temp" class="text-neutral-200">${Math.round(placeForecastData.daily.temperature_2m_min[i])}${placeForecastData.daily_units.temperature_2m_min.slice(0, 1)}</span>
		  </div>
    `;
  });

  // Render and set hourly weather data
  daysBtn.textContent = new Date(placeForecastData.hourly.time[0]).toLocaleDateString("en-US", { weekday: "long" });

  hourCount = 0;

  hourlyData.querySelectorAll("li").forEach((el, i) =>renderHourlyItem(el, placeForecastData.hourly.temperature_2m[i], i));
}

// Get place
async function getPlace(place) {
  try {
    notFound = false;

    const placeResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`);

    if (!placeResponse.ok) throw new Error("Unable to fetch place data from server");

    const { results: placeData } = await placeResponse.json();

    if (!placeData) {
      notFound = true;

      throw new Error("No search result found!");
    }

    const { latitude: lat, longitude: lng, name, country } = placeData[0];

    localStorage.setItem("selectedPlace", JSON.stringify({
        lat: lat.toFixed(2),
        lng: lng.toFixed(2),
        name: name,
        country: country
      })
    );

    placeForecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=weather_code,temperature_2m&current=weather_code,temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto${isImperial ? "&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch" : ""}`);

    displayUI();

    if (!placeForecastResponse.ok) throw new Error("We’re unable to retrieve weather data at the moment");

    placeForecastData = await placeForecastResponse.json();

    updateUI(name, country);
  } catch (err) {
    setDefaultPageTitle();

    displayErr(notFound, getErrMessage(err));
  }

  toggleVisibility(searchLoadingBox, false);
}

// Load search history from local storage
if (places.size) renderSearchDropdown();

// Update active unit indicator when imperial units are selected
if (isImperial) {
  unitKeyword.textContent = "metric";

  units.querySelectorAll(".unit").forEach(unit => unit.classList.toggle("active-unit", unit.getAttribute("aria-label") === "imperial"));
}

// Render daily and hourly boxes
dailyData.innerHTML = Array.from({length: 7}).map(() => `<li class="bg-neutral-800 shadow-ui rounded-xl flex flex-col items-center gap-4 py-4 px-2.5 min-h-41.25"></li>`).join("");

hourlyData.innerHTML = Array.from({length: 24}).map(() => `<li class="flex items-center gap-2 bg-neutral-700 shadow-ui py-2.5 pl-3 pr-4 rounded-lg min-h-15"></li>`).join("");

// EVENTS

// Show/hide units
unitsBtn.addEventListener("click", () => unitsNav.classList.toggle("active"));

// Switch units
switchUnitsBtn.addEventListener("click", function () {
  isImperial = !isImperial;

  localStorage.setItem("isImperial", isImperial);

  unitKeyword.textContent = isImperial ? "metric" : "imperial";

  units.querySelectorAll(".unit").forEach(unit => unit.classList.toggle("active-unit"));

  // Convert all values only when weather values are displayed
  if (!mainContentShowcase.classList.contains("hidden") && locationErr.classList.contains("hidden")) {
    // Update all temperature, speed and precipitation elements with converted values
    document.querySelectorAll("span[id*='temp'").forEach(el => el.textContent = `${convertTemp(parseValue(el.textContent), isImperial)}${placeForecastData.current_units.temperature_2m.slice(0, 1)}`);
    document.querySelectorAll("span[id*='speed']").forEach(el => el.textContent = `${convertSpeed(parseValue(el.textContent), isImperial)} ${isImperial ? "mph" : "km/h"}`);
    document.querySelectorAll("span[id*='precipitation']").forEach(el => el.textContent = `${convertPrecipitation(parseValue(el.textContent), isImperial)} ${isImperial ? "in" : "mm"}`);
  }
});

// Show search history
searchInputContainer.addEventListener("click", (e) => ["LABEL", "INPUT"].includes(e.target.tagName) && places.size > 0 && !searchLoadingBox.classList.contains("flex") && toggleVisibility(searchDropdown, true));

searchDropdown.addEventListener("click", function (e) {
  const removePlaceBtn = e.target.closest("svg");
  const placeBtn = e.target.closest("button");

  const placeName = placeBtn ? placeBtn.textContent.trim() : undefined;

  // Remove place from search history
  if (removePlaceBtn) {
    e.stopPropagation();

    places.delete(placeName);

    localStorage.setItem("places", JSON.stringify([...places]));

    placeBtn.remove();

    if (places.size <= 4) searchDropdown.classList.remove("overflow-y-scroll");

    // Hide search history
    if (places.size < 1) {
      localStorage.removeItem("places");

      toggleVisibility(searchDropdown, false);
    }

    return;
  }

  // Trigger place search, hide search history and show loading box
  if (placeBtn) {
    targetPlace = placeName;

    getPlace(targetPlace);

    toggleVisibility(searchDropdown, false);
    toggleVisibility(searchLoadingBox, true);
  }
});

searchBtn.addEventListener("click", function () {
  // Set searched place
  targetPlace = searchInputField.value.trim();

  // Show warning if search field is empty
  if (!targetPlace) {
    alert("Please enter a location before searching.");

    return;
  }

  // Trigger place search
  getPlace(targetPlace);

  // Save searched place
  places.add(targetPlace.toLowerCase());

  localStorage.setItem("places", JSON.stringify([...places]));

  searchInputField.value = "";

  renderSearchDropdown();

  toggleVisibility(searchLoadingBox, true);
});

retryBtn.addEventListener("click", function () {
  if (targetPlace) {
    // Retry the place search
    getPlace(targetPlace);

    toggleVisibility(searchLoadingBox, true);
  }

  // Reset UI
  toggleVisibility(APIErrContainer, false);

  toggleHiddenClass(mainContentHeaderContainer, false);
  toggleHiddenClass(mainContentShowcase, true);
  toggleHiddenClass(locationErr, true);
  toggleHiddenClass(mainContentShowcaseContainer, false);
});

// Show/hide days
daysBtn.addEventListener("click", () => daysNav.classList.toggle("active"));

daysDropdown.addEventListener("click", function (e) {
  const dayBtn = e.target.closest("button");
  const dayName = dayBtn ? dayBtn.textContent.trim() : undefined;

  // Render and display hourly forecast for the selected day (excluding the currently displayed day)
  if (dayBtn && dayName !== daysBtn.textContent.toLowerCase()) {
    hourCount = 0;

    // Find index of the selected day in the forecast data
    const indexOfDay = placeForecastData.hourly.time.map(day => new Date(day.split("T")[0]).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()).indexOf(dayName);

    // Determine API and target units for temperature conversion
    const APIUnit = placeForecastData.current_units.temperature_2m.includes("F") ? "F" : "C";
    const targetUnit = isImperial ? "F" : "C";

    // Render hourly items for the selected day with converted temperature values
    hourlyData.querySelectorAll("li").forEach(function (el, i) {
      const index = i + indexOfDay;

      renderHourlyItem(el, convertHourlyTemp(placeForecastData.hourly.temperature_2m[index], APIUnit, targetUnit), index);
    });

    daysBtn.textContent = dayName;
  }
});

window.addEventListener("click", function (e) {
  // Hide units
  if (!e.target.closest("#units-btn") && !e.target.closest("#units-dropdown") && unitsNav.classList.contains("active")) unitsNav.classList.remove("active");

  // Hide search history
  if (!["LABEL", "INPUT"].includes(e.target.tagName) && !e.target.closest("#search-dropdown")) toggleVisibility(searchDropdown, false);

  // Hide days
  if (!e.target.closest("#days-btn") && !e.target.closest("#days-dropdown") && daysNav.classList.contains("active")) daysNav.classList.remove("active");
});

window.addEventListener("load", function () {
  // Display forecast for the last searched place if it is stored
  if (JSON.parse(this.localStorage.getItem("selectedPlace"))) {
    const { lat, lng, name, country } = JSON.parse(this.localStorage.getItem("selectedPlace"));

    (async function () {
      try {
        placeForecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=weather_code,temperature_2m&current=weather_code,temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto${isImperial ? "&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch" : ""}`);

        displayUI();

        if (!placeForecastResponse.ok) throw new Error("We’re unable to retrieve weather data at the moment");

        placeForecastData = await placeForecastResponse.json();

        updateUI(name, country);
      } catch (err) {
        setDefaultPageTitle();

        displayErr(false, getErrMessage(err));
      }
    })();

    return;
  }

  // Display forecast for the place obtained from the user's current location
  (async function () {
    try {
      const position = await getPosition();
      const { latitude: lat, longitude: lng } = position.coords;

      const [placeResponse, placeForecastResponse] = await Promise.all([
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`),
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=weather_code,temperature_2m&current=weather_code,temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto${isImperial ? "&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch" : ""}`)
      ]);

      displayUI();

      if (!placeResponse.ok) {
        notFound = false;

        throw new Error("Unable to determine your location");
      }

      if (!placeForecastResponse.ok) {
        notFound = false;

        throw new Error("We’re unable to retrieve weather data at the moment");
      }

      const placeData = await placeResponse.json();
      placeForecastData = await placeForecastResponse.json();

      updateUI(placeData.city, placeData.countryName);
    } catch (err) {
      setDefaultPageTitle();

      displayErr(notFound, getErrMessage(err));
    }
  })();
});