'use strict'

let darkModeEnabled = false;
let darkModeButton = document.getElementById("dark_mode_button");
darkModeButton.addEventListener("click", switchTheme);

console.log("Dark mode enabled: " + localStorage.getItem("dark-mode"));

if (localStorage.getItem("dark-mode") === "true") {
    switchTheme();
}

function switchTheme() {
    if (!darkModeEnabled) {
        document.body.setAttribute("data-theme", "dark");
        darkModeButton.innerHTML = "Light Mode";
    } else {
        document.body.removeAttribute("data-theme")
        darkModeButton.innerHTML = "Dark Mode";
    }
    darkModeEnabled = !darkModeEnabled;
    localStorage.setItem("dark-mode", darkModeEnabled);
}