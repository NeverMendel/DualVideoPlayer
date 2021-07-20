'use strict'

const URL = window.URL || window.webkitURL;

// Global variables

let files = [];
let updateInfoIntervalId;

// DOM Elements

let dragHeader = document.getElementById("drag_header");
// let dropZoneDiv = document.getElementById("drop_zone");
let playerDiv = document.getElementById("player");
let mainVideo = document.getElementById("main_video");
let webcamVideo = document.getElementById("webcam_video");
let namesParagraph = document.getElementById("names_paragraph");
let timeInfoParagraph = document.getElementById("time_info_paragraph");

let showInfoButton = document.getElementById("show_time_info_button");
let hideWebcamButton = document.getElementById("hide_webcam");
let hideMainButton = document.getElementById("hide_main");
let offsetInput = document.getElementById("offset");
let playbackSpeedInput = document.getElementById("playback_speed");
let swapButton = document.getElementById("swap_button");

// Event listeners

document.body.addEventListener("drop", dropHandler);
document.body.addEventListener("dragover", dragOverHandler);

mainVideo.addEventListener("pause", pauseVideos);
mainVideo.addEventListener("play", playVideos);

mainVideo.addEventListener("seeked", syncVideos);
offsetInput.addEventListener("change", syncVideos);

playbackSpeedInput.addEventListener("change", changePlaybackSpeed);
swapButton.addEventListener("click", swapVideos);

showInfoButton.addEventListener("click", showInfo);
hideWebcamButton.addEventListener("click", hideWebcam);
hideMainButton.addEventListener("click", hideMain);

// Functions

function dragOverHandler(ev) {
    ev.preventDefault();
}

function dropHandler(ev) {
    ev.preventDefault();
    console.log('File(s) dropped');
    files = Array.from(ev.dataTransfer.files);
    if (files.length !== 2) {
        alert("You need to drag two and only two videos");
        return;
    }
    files.sort(function (a, b) {
        return a.name.localeCompare(b.name)
    });
    webcamVideo.src = URL.createObjectURL(files[0]);
    mainVideo.src = URL.createObjectURL(files[1]);

    dragHeader.style.display = 'none';
    document.body.style.textAlign = 'left';
    playerDiv.style.display = 'unset';

    namesParagraph.innerHTML = "Video names:";
    for (let file of files) {
        namesParagraph.innerHTML += "<br>" + file.name;
    }

    let storedItem = localStorage.getItem(files[0].name);

    if (storedItem) {
        let info = JSON.parse(storedItem);
        mainVideo.currentTime = info.time;
        offsetInput.value = info.offset;
        syncVideos();
    }

    setInterval(updateStoredTime, 5000);

    // Optional feature: set offset automatically if video duration differs
    // let durationDiff = webcamVideo.duration - mainVideo.duration;
    // offsetInput.value = durationDiff;
    // console.log("Video duration diff: " + durationDiff);
    // syncVideos();
}

function updateStoredTime() {
    let info = {};
    info.time = parseInt(mainVideo.currentTime);
    info.offset = offsetInput.value;
    localStorage.setItem(files[0].name, JSON.stringify(info));
    console.log("Saved current time " + info);
}

function pauseVideos() {
    webcamVideo.pause();
    mainVideo.pause();
    syncVideos();
}

function playVideos() {
    webcamVideo.play();
    mainVideo.play();
    syncVideos();
}

function syncVideos() {
    let timeMainVideo = mainVideo.currentTime;
    let timeWebcamVideo = timeMainVideo + parseInt(offsetInput.value);
    webcamVideo.currentTime = timeWebcamVideo >= 0 && timeWebcamVideo <= webcamVideo.duration ? timeWebcamVideo : 0;
    console.log("Main video time: " + timeMainVideo);
    console.log("Computed webcam video time: " + timeMainVideo);
    console.log("Webcam video duration: " + webcamVideo.duration);
}

function changePlaybackSpeed() {
    webcamVideo.playbackRate = playbackSpeedInput.value;
    mainVideo.playbackRate = playbackSpeedInput.value;
}

function swapVideos() {
    let timeMainVideo = mainVideo.currentTime;
    let timeWebcamVideo = webcamVideo.currentTime;
    let temp = webcamVideo.src;
    webcamVideo.src = mainVideo.src;
    mainVideo.src = temp;
    setTimeout(function () {
        mainVideo.currentTime = timeMainVideo;
        webcamVideo.currentTime = timeWebcamVideo;
        offsetInput.value = -offsetInput.value;
    }, 100);
}

function showInfo() {
    if (timeInfoParagraph.style.display === 'none') {
        timeInfoParagraph.style.display = 'unset';
        showInfoButton.innerHTML = "Hide time info";
        updateInfo();
        updateInfoIntervalId = setInterval(updateInfo, 1000);
    } else {
        showInfoButton.innerHTML = "Show time info";
        clearInterval(updateInfoIntervalId);
        timeInfoParagraph.style.display = 'none';
    }
}

function updateInfo() {
    timeInfoParagraph.innerHTML = "Webcam video: " + parseInt(webcamVideo.currentTime) + "/" + parseInt(webcamVideo.duration) + "<br>" +
        "Main video  : " + parseInt(mainVideo.currentTime) + "/" + parseInt(mainVideo.duration);
}

function hideWebcam() {
    if (webcamVideo.style.display === 'none') {
        webcamVideo.style.display = 'unset';
        hideWebcamButton.innerHTML = "Hide webcam video";
    } else {
        webcamVideo.style.display = 'none';
        hideWebcamButton.innerHTML = "Show webcam video";
    }
}

function hideMain() {
    if (mainVideo.style.display === 'none') {
        mainVideo.style.display = 'unset';
        hideMainButton.innerHTML = "Hide main video";
    } else {
        mainVideo.style.display = 'none';
        hideMainButton.innerHTML = "Show main video";
    }
}