"use strict";

// ELEMENTS
const unitsNav = document.querySelector("#units-nav");
const unitsBtn = document.querySelector("#units-btn");
const switchUnitsBtn = document.querySelector("#switch-units");

const searchInputContainer = document.querySelector("#search-input-container");
const searchInputField = document.querySelector("#place");
const searchDropdown = document.querySelector("#search-dropdown");
const searchLoadingBox = document.querySelector("#search-loading-box");
const searchBtn = document.querySelector("#search-btn");

const mainContentShowcase = document.querySelector("#main-content-showcase");
const temperatureLoadingBox = document.querySelector(
  "#temperature-loading-box"
);
const locationEl = document.querySelector("#location");
const dateEl = document.querySelector("#date");
const currentWeatherIcon = document.querySelector("#current-weather-icon");
const currentTemperature = document.querySelector("#current-temperature");
const apparentTemperature = document.querySelector("#apparent-temperature");
const relativeHumidity = document.querySelector("#relative-humidity");
const windSpeed = document.querySelector("#wind-speed");
const precipitation = document.querySelector("#precipitation");

const dailyData = document.querySelector("#daily-data");

const daysNav = document.querySelector("#days-nav");
const daysBtn = document.querySelector("#days-btn");
const daysDropdown = document.querySelector("#days-dropdown");

const hourlyData = document.querySelector("#hourly-data");

// HELPERS
let places = new Set(JSON.parse(localStorage.getItem("places")) || []);
let placeForecastResponse;
let placeForecastData;
let hourCount = 0;

const dateToday = new Date();
const dateTodayFormat = `${dateToday.toLocaleDateString("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  year: "numeric",
})}`;

// FUNCTIONS

// Render search history
function renderSearchDropdown() {
  searchDropdown.classList.remove("overflow-y-scroll");

  searchDropdown.innerHTML = [...places]
    .map(function (place) {
      return `
        <button class="text-left font-medium text-base leading-tighter capitalize py-2.5 pl-2 pr-9 hover:bg-neutral-700 hover:shadow-ui rounded-lg outline outline-1 outline-transparent focus:outline-white focus:outline-offset-1 transition-all duration-150 shadow-[0_0_0_0.0625rem_transparent] focus:shadow-neutral-900 relative group">
          ${place}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-75 transition-all duration-150" viewBox="0 0 512 512">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144M368 144L144 368" />
          </svg>
        </button>
      `;
    })
    .join("");

  if (places.size > 4) searchDropdown.classList.add("overflow-y-scroll");
}

// Show/hide element
function toggleVisibility(el, state) {
  el.classList.toggle("flex", state);
  el.classList.toggle("hidden", !state);
}

// Get weather icon data (src or alt text) from weather code
function getWeatherIconData(weatherCode) {
  switch (weatherCode) {
    case 0:
    case 1:
      return {
        src: "./assets/images/weather_icons/icon-sunny.webp",
        alt: "Sun icon",
      };

    case 2:
      return {
        src: "./assets/images/weather_icons/icon-partly-cloudy.webp",
        alt: "Partly cloudy icon",
      };

    case 3:
      return {
        src: "./assets/images/weather_icons/icon-overcast.webp",
        alt: "Overcast icon",
      };

    case 45:
    case 48:
      return {
        src: "./assets/images/weather_icons/icon-fog.webp",
        alt: "Fog icon",
      };

    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return {
        src: "./assets/images/weather_icons/icon-drizzle.webp",
        alt: "Drizzle icon",
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
        alt: "Rain icon",
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
        alt: "Snow icon",
      };

    case 95:
    case 96:
    case 99:
      return {
        src: "./assets/images/weather_icons/icon-storm.webp",
        alt: "Thunderstorm icon",
      };

    default:
      return {
        src: "",
        alt: "Image not found",
      };
  }
}

// Get place
async function getPlace(place) {
  try {
    const placeResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        place
      )}&count=1&language=en&format=json`
    );
    const { results: placeData } = await placeResponse.json();

    if (!placeData) throw new Error("No search result found!");

    const { latitude: lat, longitude: lng, name, country } = placeData[0];

    localStorage.setItem(
      "placeCoords",
      JSON.stringify({
        lat: lat.toFixed(2),
        lng: lng.toFixed(2),
        name: name,
        country: country,
      })
    );

    placeForecastResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=weather_code,temperature_2m&current=weather_code,temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`
    );

    mainContentShowcase.classList.remove("hidden");

    placeForecastData = await placeForecastResponse.json();

    toggleVisibility(temperatureLoadingBox, false);

    locationEl.textContent = `${name}, ${country}`;
    dateEl.textContent = dateTodayFormat;

    currentWeatherIcon.src = getWeatherIconData(
      placeForecastData.current.weather_code
    ).src;
    currentWeatherIcon.alt = getWeatherIconData(
      placeForecastData.current.weather_code
    ).alt;

    currentTemperature.textContent = `${Math.round(
      placeForecastData.current.temperature_2m
    )}${placeForecastData.current_units.temperature_2m.slice(0, 1)}`;

    apparentTemperature.textContent = `${Math.round(
      placeForecastData.current.apparent_temperature
    )}${placeForecastData.current_units.apparent_temperature.slice(0, 1)}`;

    relativeHumidity.textContent = `${placeForecastData.current.relative_humidity_2m}%`;

    windSpeed.textContent = `${Math.round(
      placeForecastData.current.wind_speed_10m
    )} ${placeForecastData.current_units.wind_speed_10m}`;

    precipitation.textContent = `${placeForecastData.current.precipitation.toFixed(
      1
    )} ${placeForecastData.current_units.precipitation}`;

    dailyData.querySelectorAll("li").forEach(function (el, i) {
      el.innerHTML = `
        <span class="font-medium text-lg leading-tighter capitalize">${new Date(
          placeForecastData.daily.time[i]
        ).toLocaleDateString("en-US", { weekday: "short" })}</span>
        <img src="${
          getWeatherIconData(placeForecastData.daily.weather_code[i]).src
        }" alt="${
        getWeatherIconData(placeForecastData.daily.weather_code[i]).alt
      }" class="max-h-15" />
        <div class="font-medium text-base leading-tighter flex items-center justify-between gap-4 self-stretch">
          <span id="max-temperature">${Math.round(
            placeForecastData.daily.temperature_2m_max[i]
          )}${placeForecastData.daily_units.temperature_2m_max.slice(
        0,
        1
      )}</span>
          <span id="min-temperature" class="text-neutral-200">${Math.round(
            placeForecastData.daily.temperature_2m_min[i]
          )}${placeForecastData.daily_units.temperature_2m_min.slice(
        0,
        1
      )}</span>
        </div>
      `;
    });

    daysBtn.textContent = new Date(
      placeForecastData.hourly.time[0]
    ).toLocaleDateString("en-US", { weekday: "long" });

    hourCount = 0;

    hourlyData.querySelectorAll("li").forEach(function (el, i) {
      const hourNumber = placeForecastData.hourly.time[i]
        .split("T")[1]
        .slice(0, 2);
      const period = hourNumber >= 12 ? "pm" : "am";

      if (hourNumber > 12) hourCount++;

      const hourFormatted =
        (hourNumber === "00" && "12") ||
        (hourNumber > 12 && hourCount) ||
        (hourNumber.startsWith("0") && hourNumber.slice(1)) ||
        hourNumber;

      const hour = `${hourFormatted} ${period}`;

      el.innerHTML = `
        <img src="${
          getWeatherIconData(placeForecastData.hourly.weather_code[i]).src
        }" alt="${
        getWeatherIconData(placeForecastData.hourly.weather_code[i]).alt
      }" class="h-10" />
        <span id="hour" class="font-medium text-xl leading-tighter uppercase flex-grow">${hour}</span>
        <span id="hourly-temperature" class="font-medium text-base leading-tighter">${Math.round(
          placeForecastData.hourly.temperature_2m[i]
        )}${placeForecastData.hourly_units.temperature_2m.slice(0, 1)}</span>
      `;
    });
  } catch (err) {
    console.error(err.message);
  }

  toggleVisibility(searchLoadingBox, false);
}

// Load search history from local storage
if (places.size) renderSearchDropdown();

// Render daily and hourly boxes
dailyData.innerHTML = Array.from({
  length: 7,
})
  .map(
    () =>
      `<li class="bg-neutral-800 shadow-ui rounded-xl flex flex-col items-center gap-4 py-4 px-2.5 min-h-41.25"></li>`
  )
  .join("");

hourlyData.innerHTML = Array.from({
  length: 24,
})
  .map(
    () =>
      `<li class="flex items-center gap-2 bg-neutral-700 shadow-ui py-2.5 pl-3 pr-4 rounded-lg min-h-15"></li>`
  )
  .join("");

// EVENTS

// Show units
unitsBtn.addEventListener("click", () => unitsNav.classList.toggle("active"));

// Switch units
switchUnitsBtn.addEventListener("click", () =>
  document
    .querySelector("#units")
    .querySelectorAll(".unit")
    .forEach(unit => unit.classList.toggle("active-unit"))
);

// Show search history
searchInputContainer.addEventListener("click", function (e) {
  if (
    ["LABEL", "INPUT"].includes(e.target.tagName) &&
    places.size > 0 &&
    !searchLoadingBox.classList.contains("flex")
  ) {
    toggleVisibility(searchDropdown, true);
  }
});

searchDropdown.addEventListener("click", function (e) {
  const removePlaceBtn = e.target.closest("svg");

  // Remove place from search history
  if (removePlaceBtn) {
    e.stopPropagation();

    const placeName = removePlaceBtn.parentElement.textContent.trim();

    places.delete(placeName);

    localStorage.setItem("places", JSON.stringify([...places]));

    removePlaceBtn.parentElement.remove();

    if (places.size <= 4) searchDropdown.classList.remove("overflow-y-scroll");

    // Hide search history
    if (places.size < 1) {
      localStorage.removeItem("places");

      toggleVisibility(searchDropdown, false);
    }

    return;
  }

  // Hide search history and show loading box
  if (e.target.closest("button")) {
    toggleVisibility(searchDropdown, false);
    toggleVisibility(searchLoadingBox, true);
  }
});

searchBtn.addEventListener("click", function () {
  // Show warning if search field is empty
  if (!searchInputField.value.trim()) {
    alert("Please enter a location before searching.");

    return;
  }

  getPlace(searchInputField.value.trim());

  places.add(searchInputField.value.trim().toLowerCase());

  localStorage.setItem("places", JSON.stringify([...places]));

  renderSearchDropdown();

  toggleVisibility(searchLoadingBox, true);
});

// Show days
daysBtn.addEventListener("click", () => daysNav.classList.toggle("active"));

daysDropdown.addEventListener("click", function (e) {
  const dayBtn = e.target.closest("button");
  const dayName = dayBtn ? dayBtn.textContent.trim() : undefined;

  if (dayBtn && dayName !== daysBtn.textContent.toLowerCase()) {
    hourCount = 0;

    const indexOfDay = placeForecastData.hourly.time
      .map(day =>
        new Date(day.split("T")[0])
          .toLocaleDateString("en-US", {
            weekday: "long",
          })
          .toLowerCase()
      )
      .indexOf(dayName);

    hourlyData.querySelectorAll("li").forEach(function (el, i) {
      const index = i + indexOfDay;

      const hourNumber = placeForecastData.hourly.time[index]
        .split("T")[1]
        .slice(0, 2);
      const period = hourNumber >= 12 ? "pm" : "am";

      if (hourNumber > 12) hourCount++;

      const hourFormatted =
        (hourNumber === "00" && "12") ||
        (hourNumber > 12 && hourCount) ||
        (hourNumber.startsWith("0") && hourNumber.slice(1)) ||
        hourNumber;

      const hour = `${hourFormatted} ${period}`;

      el.innerHTML = `
        <img src="${
          getWeatherIconData(placeForecastData.hourly.weather_code[index]).src
        }" alt="${
        getWeatherIconData(placeForecastData.hourly.weather_code[index]).alt
      }" class="h-10" />
        <span id="hour" class="font-medium text-xl leading-tighter uppercase flex-grow">${hour}</span>
        <span id="hourly-temperature" class="font-medium text-base leading-tighter">${Math.round(
          placeForecastData.hourly.temperature_2m[index]
        )}${placeForecastData.hourly_units.temperature_2m.slice(0, 1)}</span>
      `;
    });

    daysBtn.textContent = dayName;
  }
});

window.addEventListener("click", function (e) {
  // Hide units
  if (
    !e.target.closest("#units-btn") &&
    !e.target.closest("#units-dropdown") &&
    unitsNav.classList.contains("active")
  )
    unitsNav.classList.remove("active");

  // Hide search history
  if (
    !["LABEL", "INPUT"].includes(e.target.tagName) &&
    !e.target.closest("#search-dropdown")
  )
    toggleVisibility(searchDropdown, false);

  // Hide days
  if (
    !e.target.closest("#days-btn") &&
    !e.target.closest("#days-dropdown") &&
    daysNav.classList.contains("active")
  )
    daysNav.classList.remove("active");
});

window.addEventListener("load", function () {
  if (JSON.parse(this.localStorage.getItem("placeCoords"))) {
    const { lat, lng, name, country } = JSON.parse(
      this.localStorage.getItem("placeCoords")
    );

    (async function () {
      try {
        placeForecastResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=weather_code,temperature_2m&current=weather_code,temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`
        );

        mainContentShowcase.classList.remove("hidden");

        placeForecastData = await placeForecastResponse.json();

        toggleVisibility(temperatureLoadingBox, false);

        locationEl.textContent = `${name}, ${country}`;
        dateEl.textContent = dateTodayFormat;

        currentWeatherIcon.src = getWeatherIconData(
          placeForecastData.current.weather_code
        ).src;
        currentWeatherIcon.alt = getWeatherIconData(
          placeForecastData.current.weather_code
        ).alt;

        currentTemperature.textContent = `${Math.round(
          placeForecastData.current.temperature_2m
        )}${placeForecastData.current_units.temperature_2m.slice(0, 1)}`;

        apparentTemperature.textContent = `${Math.round(
          placeForecastData.current.apparent_temperature
        )}${placeForecastData.current_units.apparent_temperature.slice(0, 1)}`;

        relativeHumidity.textContent = `${placeForecastData.current.relative_humidity_2m}%`;

        windSpeed.textContent = `${Math.round(
          placeForecastData.current.wind_speed_10m
        )} ${placeForecastData.current_units.wind_speed_10m}`;

        precipitation.textContent = `${placeForecastData.current.precipitation.toFixed(
          1
        )} ${placeForecastData.current_units.precipitation}`;

        dailyData.querySelectorAll("li").forEach(function (el, i) {
          el.innerHTML = `
        <span class="font-medium text-lg leading-tighter capitalize">${new Date(
          placeForecastData.daily.time[i]
        ).toLocaleDateString("en-US", { weekday: "short" })}</span>
        <img src="${
          getWeatherIconData(placeForecastData.daily.weather_code[i]).src
        }" alt="${
            getWeatherIconData(placeForecastData.daily.weather_code[i]).alt
          }" class="max-h-15" />
        <div class="font-medium text-base leading-tighter flex items-center justify-between gap-4 self-stretch">
          <span id="max-temperature">${Math.round(
            placeForecastData.daily.temperature_2m_max[i]
          )}${placeForecastData.daily_units.temperature_2m_max.slice(
            0,
            1
          )}</span>
          <span id="min-temperature" class="text-neutral-200">${Math.round(
            placeForecastData.daily.temperature_2m_min[i]
          )}${placeForecastData.daily_units.temperature_2m_min.slice(
            0,
            1
          )}</span>
        </div>
      `;
        });

        daysBtn.textContent = new Date(
          placeForecastData.hourly.time[0]
        ).toLocaleDateString("en-US", { weekday: "long" });

        hourCount = 0;

        hourlyData.querySelectorAll("li").forEach(function (el, i) {
          const hourNumber = placeForecastData.hourly.time[i]
            .split("T")[1]
            .slice(0, 2);
          const period = hourNumber >= 12 ? "pm" : "am";

          if (hourNumber > 12) hourCount++;

          const hourFormatted =
            (hourNumber === "00" && "12") ||
            (hourNumber > 12 && hourCount) ||
            (hourNumber.startsWith("0") && hourNumber.slice(1)) ||
            hourNumber;

          const hour = `${hourFormatted} ${period}`;

          el.innerHTML = `
        <img src="${
          getWeatherIconData(placeForecastData.hourly.weather_code[i]).src
        }" alt="${
            getWeatherIconData(placeForecastData.hourly.weather_code[i]).alt
          }" class="h-10" />
        <span id="hour" class="font-medium text-xl leading-tighter uppercase flex-grow">${hour}</span>
        <span id="hourly-temperature" class="font-medium text-base leading-tighter">${Math.round(
          placeForecastData.hourly.temperature_2m[i]
        )}${placeForecastData.hourly_units.temperature_2m.slice(0, 1)}</span>
      `;
        });
      } catch (err) {
        console.error(err.message);
      }
    })();
  }
});
