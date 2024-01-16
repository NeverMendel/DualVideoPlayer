"use strict";

let darkModeEnabled = false;
let darkModeButton = document.getElementById("dark_mode_button");
darkModeButton.addEventListener("click", switchTheme);

console.log("Dark mode enabled: " + getCookie("dark-mode"));

if (getCookie("dark-mode") === "true") {
  switchTheme();
}

function switchTheme() {
  if (!darkModeEnabled) {
    document.body.setAttribute("data-theme", "dark");
    darkModeButton.innerHTML = "Light Mode";
  } else {
    document.body.removeAttribute("data-theme");
    darkModeButton.innerHTML = "Dark Mode";
  }
  darkModeEnabled = !darkModeEnabled;
  setCookie("dark-mode", darkModeEnabled, 10 * 365);
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
