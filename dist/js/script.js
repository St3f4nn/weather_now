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

const daysNav = document.querySelector("#days-nav");
const daysBtn = document.querySelector("#days-btn");

// HELPERS
let places = new Set(JSON.parse(localStorage.getItem("places")) || []);

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

// Load search history from local storage
if (places.size) renderSearchDropdown();

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

  places.add(searchInputField.value.trim().toLowerCase());

  localStorage.setItem("places", JSON.stringify([...places]));

  renderSearchDropdown();

  toggleVisibility(searchLoadingBox, true);
});

// Show days
daysBtn.addEventListener("click", () => daysNav.classList.toggle("active"));

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
