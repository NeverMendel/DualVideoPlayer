'use strict'

const URL = window.URL || window.webkitURL;

// Global variables

let files = [];
let updateInfoIntervalId;
let webcamLinked = true;
let videoSwapped = false;

// Constants

const LOAD_VIDEO_DELAY_MS = 300;

// DOM Elements

let dragHeader = document.getElementById("drag_header");
// let dropZoneDiv = document.getElementById("drop_zone");
let playerDiv = document.getElementById("player_div");
let mainVideo = document.getElementById("main_video");
let webcamVideo = document.getElementById("webcam_video");
let namesParagraph = document.getElementById("names_paragraph");
let timeInfoDiv = document.getElementById("time_info_div");

let showInfoButton = document.getElementById("show_time_info_button");
let hideWebcamButton = document.getElementById("hide_webcam_button");
let hideMainButton = document.getElementById("hide_main_button");
let unlinkWebcamButton = document.getElementById("unlink_webcam_button");
let offsetInput = document.getElementById("offset_input");
let playbackSpeedInput = document.getElementById("playback_speed_input");
let swapButton = document.getElementById("swap_button");

// Event listeners

document.body.addEventListener("drop", dropHandler);
document.body.addEventListener("dragover", dragOverHandler);

mainVideo.addEventListener("pause", pauseVideo);
mainVideo.addEventListener("play", playVideo);

mainVideo.addEventListener("seeked", syncVideos);
offsetInput.addEventListener("change", syncVideos);

playbackSpeedInput.addEventListener("change", changePlaybackSpeed);
swapButton.addEventListener("click", swapVideos);

showInfoButton.addEventListener("click", showInfo);
hideWebcamButton.addEventListener("click", () => hideVideo(hideWebcamButton, webcamVideo, "webcam"));
hideMainButton.addEventListener("click", () => hideVideo(hideMainButton, mainVideo, "main"));
unlinkWebcamButton.addEventListener("click", unlinkWebcam);

// Functions

function round(value, precision) {
    let multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function dragOverHandler(ev) {
    ev.preventDefault();
}

function dropHandler(ev) {
    ev.preventDefault();
    if (window.location.href.indexOf("example.html") !== -1) {
        alert("You cannot drop videos in the example page. You will be redirected to the main one, drop your videos there.");
        window.location.href = window.location.href.replace("example.html", "index.html")
        return;
    }
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
        setTimeout(function () {
            offsetInput.value = info.offset;
            mainVideo.currentTime = info.time;
            mainVideo.play();
        }, LOAD_VIDEO_DELAY_MS);
    } else {
        setTimeout(function () {
            mainVideo.play();
        }, LOAD_VIDEO_DELAY_MS);
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
    if (!videoSwapped) {
        info.time = parseInt(mainVideo.currentTime);
        info.offset = offsetInput.value;
    } else {
        info.time = parseInt(webcamVideo.currentTime);
        info.offset = -offsetInput.value;
    }
    localStorage.setItem(files[0].name, JSON.stringify(info));
    // console.log("Saved video current time in browser local storage");
}

function pauseVideo() {
    if (webcamLinked) {
        webcamVideo.pause();
        // syncVideos();
    }
}

function playVideo() {
    if (webcamLinked) {
        webcamVideo.play();
        // syncVideos();
    }
}

function syncVideos() {
    if (webcamLinked) {
        let playing = isVideoPlaying(mainVideo);
        if (playing)
            mainVideo.pause();
        let timeMainVideo = mainVideo.currentTime;
        let timeWebcamVideo = timeMainVideo + parseInt(offsetInput.value);
        webcamVideo.currentTime = timeWebcamVideo >= 0 && timeWebcamVideo <= webcamVideo.duration ? timeWebcamVideo : 0;
        if (playing)
            mainVideo.play();
        console.groupCollapsed("Videos synced");
        console.log("Main video time: " + timeMainVideo);
        console.log("Computed webcam video time: " + timeMainVideo);
        console.log("Offset: " + offsetInput.value);
        console.log("Webcam video duration: " + webcamVideo.duration);
        console.groupEnd();
    }
}

function changePlaybackSpeed() {
    webcamVideo.playbackRate = playbackSpeedInput.value;
    mainVideo.playbackRate = playbackSpeedInput.value;
}

function swapVideos() {
    let playing = isVideoPlaying(mainVideo);
    let timeWebcamVideo = webcamVideo.currentTime;
    let temp = webcamVideo.src;
    webcamVideo.src = mainVideo.src;
    mainVideo.src = temp;
    offsetInput.value = -offsetInput.value;
    videoSwapped = !videoSwapped;
    setTimeout(function () {
        mainVideo.currentTime = timeWebcamVideo;
        if (playing) mainVideo.play();
    }, LOAD_VIDEO_DELAY_MS);
}

function showInfo() {
    if (timeInfoDiv.style.display === 'none') {
        timeInfoDiv.style.display = 'unset';
        showInfoButton.innerHTML = "Hide time info";
        updateInfo();
        updateInfoIntervalId = setInterval(updateInfo, 1000);
    } else {
        showInfoButton.innerHTML = "Show time info";
        clearInterval(updateInfoIntervalId);
        timeInfoDiv.style.display = 'none';
    }
}

function updateInfo() {
    timeInfoDiv.innerHTML = "Webcam video: " + parseInt(webcamVideo.currentTime) + "/" + parseInt(webcamVideo.duration) + "<br>" +
        "Main video  : " + parseInt(mainVideo.currentTime) + "/" + parseInt(mainVideo.duration);
}

function hideVideo(button, video, videoSource) {
    if (video.style.display === 'none') {
        video.style.display = 'unset';
        button.innerHTML = "Hide " + videoSource + " video";
    } else {
        video.style.display = 'none';
        button.innerHTML = "Show " + videoSource + " video";
    }
}

function unlinkWebcam() {
    if (webcamLinked) {
        webcamLinked = false;
        webcamVideo.pause();
        unlinkWebcamButton.innerHTML = "Link webcam video";
    } else {
        webcamLinked = true;
        offsetInput.value = round(webcamVideo.currentTime - mainVideo.currentTime, 1);
        syncVideos();
        if (!mainVideo.paused) webcamVideo.play();
        unlinkWebcamButton.innerHTML = "Freeze and unlink webcam video";
    }
}

function isVideoPlaying(video) {
    return video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
}