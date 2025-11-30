"use strict";

document.querySelector("#switch-units").addEventListener("click", function () {
  document
    .querySelector(".units-dropdown")
    .querySelectorAll(".unit")
    .forEach(unit => unit.classList.toggle("active-unit"));
});

document.querySelector("#units-btn").addEventListener("click", function () {
  document.querySelector("nav").classList.toggle("active");
});

window.addEventListener("click", function (e) {
  if (
    !e.target.closest("#units-btn") &&
    !e.target.closest("#units-dropdown-container") &&
    document.querySelector("nav").classList.contains("active")
  )
    document.querySelector("nav").classList.remove("active");
});
