/* ============================================================
   ARCHIVE — MAIN APPLICATION
   Version 3.1
   ============================================================ */

"use strict";

/* ============================================================
   CONFIGURATION
   ============================================================ */

const CONFIG = {
    totalPhotos: 22,
    totalVideos: 19,
    totalSongs: 26,

    transitionDuration: 420,

    storageKey: "archiveAnalytics",
    sessionKey: "archiveCurrentSession",

    defaultVolume: 0.8,

    photoPath: "assets/photos/",
    videoPath: "assets/videos/",
    musicPath: "assets/music/",
    thumbnailPath: "assets/music/thumbnails/"
};


/* ============================================================
   SONG LIBRARY
   ============================================================ */

const songs = [
    {
        id: 1,
        name: "Nasha",
        file: "A1.mp4",
        thumbnail: "1.png"
    },
    {
        id: 2,
        name: "Into you",
        file: "B2.mp4",
        thumbnail: "2.png"
    },
    {
        id: 3,
        name: "Ajab sa",
        file: "C3.mp4",
        thumbnail: "3.png"
    },
    {
        id: 4,
        name: "Dewaaniyat",
        file: "D4.mp4",
        thumbnail: "4.png"
    },
    {
        id: 5,
        name: "Inna sona",
        file: "E5.mp4",
        thumbnail: "5.png"
    },
    {
        id: 6,
        name: "Ishq Bullava",
        file: "F6.mp4",
        thumbnail: "6.png"
    },
    {
        id: 7,
        name: "Kalyani",
        file: "G7.mp4",
        thumbnail: "7.png"
    },
    {
        id: 8,
        name: "Bol na halke halke",
        file: "H8.mp4",
        thumbnail: "8.png"
    },
    {
        id: 9,
        name: "Mera yaar",
        file: "I9.mp4",
        thumbnail: "9.png"
    },
    {
        id: 10,
        name: "Fakira",
        file: "J10.mp4",
        thumbnail: "10.png"
    },
    {
        id: 11,
        name: "Ter bin",
        file: "K11.mp4",
        thumbnail: "11.png"
    },
    {
        id: 12,
        name: "Tere jiya hor disda",
        file: "L12.mp4",
        thumbnail: "12.png"
    },
    {
        id: 13,
        name: "Teri narron ke sadke",
        file: "M13.mp4",
        thumbnail: "13.png"
    },
    {
        id: 14,
        name: "Teri bin",
        file: "N14.mp4",
        thumbnail: "14.png"
    },
    {
        id: 15,
        name: "Aarzu",
        file: "O15.mp4",
        thumbnail: "15.png"
    },
    {
        id: 16,
        name: "Teri narzon ke karan",
        file: "P16.mp4",
        thumbnail: "16.png"
    },
    {
        id: 17,
        name: "Dil diya gallan",
        file: "Q17.mp4",
        thumbnail: "17.png"
    },
    {
        id: 18,
        name: "Gallan Goodiyan",
        file: "R18.mp4",
        thumbnail: "18.png"
    },
    {
        id: 19,
        name: "Maula maula re",
        file: "S19.mp4",
        thumbnail: "19.png"
    },
    {
        id: 20,
        name: "O rangrez",
        file: "T20.mp4",
        thumbnail: "20.png"
    },
    {
        id: 21,
        name: "Paniyon sa",
        file: "U21.mp4",
        thumbnail: "21.png"
    },
    {
        id: 22,
        name: "Tere mast mast do nain",
        file: "V22.mp4",
        thumbnail: "22.png"
    },
    {
        id: 23,
        name: "Sajda",
        file: "W23.mp4",
        thumbnail: "23.png"
    },
    {
        id: 24,
        name: "Ve haaniyan",
        file: "X24.mp4",
        thumbnail: "24.png"
    },
    {
        id: 25,
        name: "Heeriye",
        file: "Y25.mp4",
        thumbnail: "25.png"
    },
    {
        id: 26,
        name: "New song",
        file: "Z26.mp4",
        thumbnail: "26.png"
    }
];


/* ============================================================
   MEDIA LIBRARY
   ============================================================ */

const photos = [];

for (let i = 1; i <= CONFIG.totalPhotos; i++) {

    let extension = "jpg";

    if ([4, 11, 12, 13, 16].includes(i)) {
        extension = "png";
    }

    photos.push({
        id: `photo-${i}`,
        type: "photo",
        index: i,
        name: `PHOTO ${i}`,
        file: `${i}.${extension}`,
        path: `${CONFIG.photoPath}${i}.${extension}`
    });
}


const videoLetters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S"
];


const videos = videoLetters.map(
    (letter, index) => {

        const number = index + 1;

        return {
            id: `video-${letter}`,
            type: "video",
            index: number,
            name: `VIDEO ${letter}`,
            file: `${letter}.mp4`,
            path: `${CONFIG.videoPath}${letter}.mp4`
        };
    }
);


const mediaLibrary = [
    ...photos,
    ...videos
];


/* ============================================================
   APPLICATION STATE
   ============================================================ */

const state = {

    currentScreen: "music",

    selectedSong: null,
    currentSongIndex: null,

    currentMediaIndex: 0,

    zoom: 1,

    volume: CONFIG.defaultVolume,
    muted: false,

    viewMode: "grid",

    sessionStarted: false,
    sessionStartTime: null,

    mediaStartTime: null,
    mediaElapsedSeconds: 0,

    currentMediaWatchTime: 0,

    dashboardReturnScreen: "viewer",

    selectedDashboardMonth: null
};


/* ============================================================
   ANALYTICS
   ============================================================ */

let analytics = {
    sessions: [],
    media: {},
    daily: {}
};


/* ============================================================
   DOM REFERENCES
   ============================================================ */

const elements = {};


function $(id) {

    return document.getElementById(id);
}


function on(
    element,
    event,
    handler
) {

    if (!element) {
        return;
    }

    element.addEventListener(
        event,
        handler
    );
}


function cacheElements() {

    elements.loader =
        document.querySelector(
            ".app-loader"
        );

    elements.musicScreen =
        document.getElementById(
            "music-screen"
        );

    elements.viewerScreen =
        document.getElementById(
            "viewer-screen"
        );

    elements.dashboardScreen =
        document.getElementById(
            "dashboard-screen"
        );


    elements.songContainer =
        document.getElementById(
            "song-container"
        );

    elements.viewToggle =
        document.getElementById(
            "view-toggle"
        );

    elements.viewMode =
        document.getElementById(
            "view-mode"
        );

    elements.skipButton =
        document.getElementById(
            "skip-button"
        );


    elements.backgroundAudio =
        document.getElementById(
            "background-audio"
        );


    elements.currentMediaName =
        document.getElementById(
            "current-media-name"
        );

    elements.mediaWrapper =
        document.getElementById(
            "media-wrapper"
        );

    elements.mediaWatchTime =
        document.getElementById(
            "media-watch-time"
        );

    elements.mediaPosition =
        document.getElementById(
            "media-position"
        );


    elements.previousMedia =
        document.getElementById(
            "previous-media"
        );

    elements.nextMedia =
        document.getElementById(
            "next-media"
        );


    elements.volumeButton =
        document.getElementById(
            "volume-button"
        );

    elements.volumePopup =
        document.getElementById(
            "volume-popup"
        );

    elements.muteButton =
        document.getElementById(
            "mute-button"
        );

    elements.volumeSlider =
        document.getElementById(
            "volume-slider"
        );


    elements.fullscreenButton =
        document.getElementById(
            "fullscreen-button"
        );

    elements.openDashboard =
        document.getElementById(
            "open-dashboard"
        );


    elements.zoomSlider =
        document.getElementById(
            "zoom-slider"
        );

    elements.zoomButton =
        document.getElementById(
            "zoom-button"
        );


    elements.dashboardBack =
        document.getElementById(
            "dashboard-back"
        );

    elements.monthSelector =
        document.getElementById(
            "month-selector"
        );

    elements.currentMonthLabel =
        document.getElementById(
            "month-label"
        );
}


/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp,
    {
        once: true
    }
);


function initializeApp() {

    cacheElements();

    initializeAnalytics();

    repairAnalytics();

    initializeMusicScreen();

    initializeViewer();

    initializeDashboard();

    initializeAudio();

    initializeTransitions();

    hideLoader();

    updateViewMode();
}


/* ============================================================
   LOADER
   ============================================================ */

function hideLoader() {

    if (!elements.loader) {
        return;
    }

    window.setTimeout(
        () => {

            elements.loader.classList.add(
                "hidden"
            );

        },
        700
    );
}


/* ============================================================
   SCREEN MANAGEMENT
   ============================================================ */

function showScreen(
    screenName
) {

    const screens =
        document.querySelectorAll(
            ".screen"
        );


    screens.forEach(
        screen => {

            screen.classList.remove(
                "active"
            );
        }
    );


    let target = null;


    if (screenName === "music") {
        target =
            elements.musicScreen;
    }

    if (screenName === "viewer") {
        target =
            elements.viewerScreen;
    }

    if (screenName === "dashboard") {
        target =
            elements.dashboardScreen;
    }


    if (!target) {
        return;
    }


    target.classList.add(
        "active"
    );


    state.currentScreen =
        screenName;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ============================================================
   TRANSITIONS
   ============================================================ */

function initializeTransitions() {
    // Transition system uses transitionTo().
}


function transitionTo(
    screenName
) {

    const overlay =
        document.querySelector(
            ".transition-overlay"
        );


    if (!overlay) {

        showScreen(
            screenName
        );

        return;
    }


    overlay.classList.add(
        "active"
    );

    overlay.classList.add(
        "show"
    );


    window.setTimeout(
        () => {

            showScreen(
                screenName
            );

        },
        CONFIG.transitionDuration / 2
    );


    window.setTimeout(
        () => {

            overlay.classList.remove(
                "active"
            );

            overlay.classList.remove(
                "show"
            );

        },
        CONFIG.transitionDuration
    );
}


/* ============================================================
   MUSIC SCREEN
   ============================================================ */

function initializeMusicScreen() {

    renderSongs();

    setupViewToggle();

    setupSkipButton();
}


function renderSongs() {

    if (!elements.songContainer) {
        return;
    }


    elements.songContainer.innerHTML =
        "";


    songs.forEach(
        (song, index) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "song-card";


            card.dataset.songIndex =
                index;


            card.innerHTML = `
                <div class="song-thumbnail">

                    <img
                        src="${CONFIG.thumbnailPath}${song.thumbnail}"
                        alt="${escapeHtml(song.name)}"
                        loading="lazy"
                    >

                    <div class="thumbnail-overlay"></div>

                    <div class="thumbnail-shine"></div>

                    <div class="corner-accent"></div>

                    <div class="track-number">
                        ${String(song.id).padStart(2, "0")}
                    </div>

                    <button
                        class="song-preview-button"
                        type="button"
                        aria-label="Preview ${escapeHtml(song.name)}"
                    >
                        <span class="song-play-indicator">
                            ▶
                        </span>
                    </button>

                </div>

                <div class="song-info">

                    <div class="song-subtitle">
                        TRACK ${String(song.id).padStart(2, "0")}
                    </div>

                    <div class="song-title">
                        ${escapeHtml(song.name)}
                    </div>

                    <div class="song-file">
                        ${escapeHtml(song.file)}
                    </div>

                </div>
            `;


            const previewButton =
                card.querySelector(
                    ".song-preview-button"
                );


            on(
                previewButton,
                "click",
                event => {

                    event.stopPropagation();

                    previewSong(index);
                }
            );


            on(
                card,
                "click",
                () => {

                    selectSong(index);
                }
            );


            elements.songContainer.appendChild(
                card
            );
        }
    );
}


/* ============================================================
   SONG SELECTION
   ============================================================ */

function selectSong(
    index
) {

    if (
        index < 0 ||
        index >= songs.length
    ) {
        return;
    }


    state.selectedSong =
        songs[index];

    state.currentSongIndex =
        index;


    document
        .querySelectorAll(
            ".song-card"
        )
        .forEach(
            card => {

                card.classList.remove(
                    "selected"
                );


                if (
                    Number(
                        card.dataset.songIndex
                    ) === index
                ) {

                    card.classList.add(
                        "selected"
                    );
                }
            }
        );


    playBackgroundSong(
        state.selectedSong
    );


    startViewer();


    transitionTo(
        "viewer"
    );
}


/* ============================================================
   SONG PREVIEW
   ============================================================ */

function previewSong(
    index
) {

    if (
        index < 0 ||
        index >= songs.length
    ) {
        return;
    }


    const song =
        songs[index];


    playBackgroundSong(
        song
    );


    document
        .querySelectorAll(
            ".song-card"
        )
        .forEach(
            card => {

                card.classList.remove(
                    "active-song"
                );
            }
        );


    const activeCard =
        document.querySelector(
            `.song-card[data-song-index="${index}"]`
        );


    if (activeCard) {

        activeCard.classList.add(
            "active-song"
        );
    }
}


/* ============================================================
   AUDIO
   ============================================================ */

function initializeAudio() {

    if (!elements.backgroundAudio) {
        return;
    }


    elements.backgroundAudio.volume =
        state.volume;


    elements.backgroundAudio.loop =
        true;
}


function playBackgroundSong(
    song
) {

    if (!elements.backgroundAudio) {
        return;
    }


    const audio =
        elements.backgroundAudio;


    const source =
        `${CONFIG.musicPath}${song.file}`;


    if (
        audio.src &&
        audio.src.includes(
            song.file
        )
    ) {

        audio.play().catch(
            () => {}
        );

        return;
    }


    audio.src =
        source;


    audio.volume =
        state.muted
            ? 0
            : state.volume;


    audio.loop =
        true;


    audio.load();


    audio.play().catch(
        () => {}
    );
}


/* ============================================================
   VIEW MODE
   ============================================================ */

function setupViewToggle() {

    if (!elements.viewToggle) {
        return;
    }


    on(
        elements.viewToggle,
        "click",
        () => {

            state.viewMode =
                state.viewMode === "grid"
                    ? "list"
                    : "grid";


            updateViewMode();
        }
    );
}


function updateViewMode() {

    if (!elements.songContainer) {
        return;
    }


    elements.songContainer.classList.toggle(
        "grid-view",
        state.viewMode === "grid"
    );


    elements.songContainer.classList.toggle(
        "list-view",
        state.viewMode === "list"
    );


    if (elements.viewMode) {

        elements.viewMode.textContent =
            state.viewMode === "grid"
                ? "GRID"
                : "LIST";
    }
}


/* ============================================================
   SKIP
   ============================================================ */

function setupSkipButton() {

    if (!elements.skipButton) {
        return;
    }


    on(
        elements.skipButton,
        "click",
        () => {

            startViewer();

            transitionTo(
                "viewer"
            );
        }
    );
}


/* ============================================================
   VIEWER START
   ============================================================ */

function startViewer() {

    state.currentMediaIndex =
        0;

    state.zoom =
        1;


    startSession();


    loadMedia(
        0,
        true
    );
}


/* ============================================================
   VIEWER INITIALIZATION
   ============================================================ */

function initializeViewer() {

    setupNavigation();

    setupVolumeControls();

    setupZoomControls();

    setupFullscreen();

    setupDashboardButton();
}


/* ============================================================
   MEDIA HELPERS
   ============================================================ */

function getMedia(
    index
) {

    if (
        index < 0 ||
        index >= mediaLibrary.length
    ) {
        return null;
    }


    return mediaLibrary[index];
}


/* ============================================================
   MEDIA LOADING
   ============================================================ */

function loadMedia(
    index,
    isInitialLoad = false
) {

    if (
        index < 0 ||
        index >= mediaLibrary.length
    ) {
        return;
    }


    if (
        !isInitialLoad
    ) {

        commitCurrentMediaTime();
    }


    state.currentMediaIndex =
        index;


    state.mediaStartTime =
        Date.now();


    state.mediaElapsedSeconds =
        0;


    state.currentMediaWatchTime =
        0;


    state.zoom =
        1;


    const media =
        getMedia(
            index
        );


    if (!media) {
        return;
    }


    ensureMediaStats(
        media
    );


    incrementMediaOpen(
        media
    );


    renderMedia(
        media
    );


    updateMediaName(
        media
    );


    updateMediaPosition();

    updateZoomUI();

    applyVolume();

    startMediaTimer();
}


/* ============================================================
   MEDIA RENDERING
   ============================================================ */

function renderMedia(
    media
) {

    if (!elements.mediaWrapper) {
        return;
    }


    elements.mediaWrapper.innerHTML =
        "";


    if (
        media.type === "photo"
    ) {

        const image =
            document.createElement(
                "img"
            );


        image.className =
            "viewer-image viewer-photo";


        image.src =
            media.path;


        image.alt =
            media.name;


        image.draggable =
            false;


        elements.mediaWrapper.appendChild(
            image
        );


        return;
    }


    if (
        media.type === "video"
    ) {

        const video =
            document.createElement(
                "video"
            );


        video.className =
            "viewer-video";


        video.src =
            media.path;


        video.autoplay =
            true;


        video.loop =
            true;


        video.playsInline =
            true;


        video.controls =
            false;


        video.muted =
            state.muted;


        video.volume =
            state.muted
                ? 0
                : state.volume;


        on(
            video,
            "loadedmetadata",
            () => {

                video.play().catch(
                    () => {}
                );
            }
        );


        elements.mediaWrapper.appendChild(
            video
        );
    }
}


/* ============================================================
   MEDIA NAME / POSITION
   ============================================================ */

function updateMediaName(
    media
) {

    if (
        elements.currentMediaName
    ) {

        elements.currentMediaName.textContent =
            media.name;
    }
}


function updateMediaPosition() {

    if (
        !elements.mediaPosition
    ) {
        return;
    }


    elements.mediaPosition.textContent =
        `${state.currentMediaIndex + 1} / ${mediaLibrary.length}`;
}


/* ============================================================
   NAVIGATION
   ============================================================ */

function setupNavigation() {

    on(
        elements.previousMedia,
        "click",
        previousMedia
    );


    on(
        elements.nextMedia,
        "click",
        nextMedia
    );
}


function previousMedia() {

    if (!mediaLibrary.length) {
        return;
    }


    commitCurrentMediaTime();


    let previousIndex =
        state.currentMediaIndex - 1;


    if (
        previousIndex < 0
    ) {

        previousIndex =
            mediaLibrary.length - 1;
    }


    loadMedia(
        previousIndex
    );
}


/* ============================================================
   NEXT MEDIA
   FINAL MEDIA → DASHBOARD
   ============================================================ */

function nextMedia() {

    if (!mediaLibrary.length) {
        return;
    }


    commitCurrentMediaTime();


    const nextIndex =
        state.currentMediaIndex + 1;


    if (
        nextIndex >=
        mediaLibrary.length
    ) {

        endSession();


        state.dashboardReturnScreen =
            "viewer";


        renderDashboard();


        showScreen(
            "dashboard"
        );


        return;
    }


    loadMedia(
        nextIndex
    );
}


/* ============================================================
   MEDIA TIMER
   ============================================================ */

let mediaTimerInterval =
    null;


function startMediaTimer() {

    stopMediaTimer();


    state.mediaStartTime =
        Date.now();


    mediaTimerInterval =
        window.setInterval(
            updateMediaTimer,
            1000
        );
}


function stopMediaTimer() {

    if (
        mediaTimerInterval !== null
    ) {

        window.clearInterval(
            mediaTimerInterval
        );


        mediaTimerInterval =
            null;
    }
}


function updateMediaTimer() {

    if (
        !state.mediaStartTime
    ) {
        return;
    }


    const elapsed =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now() -
                    state.mediaStartTime
                ) / 1000
            )
        );


    state.mediaElapsedSeconds =
        elapsed;


    state.currentMediaWatchTime =
        elapsed;


    updateWatchTimerDisplay(
        elapsed
    );
}


function updateWatchTimerDisplay(
    seconds
) {

    if (
        elements.mediaWatchTime
    ) {

        elements.mediaWatchTime.textContent =
            formatTime(
                seconds
            );
    }
}


/* ============================================================
   TIME FORMATTING
   ============================================================ */

function normalizeSeconds(
    value
) {

    return Math.max(
        0,
        Math.floor(
            Number(value) || 0
        )
    );
}


function formatTime(
    seconds
) {

    seconds =
        normalizeSeconds(
            seconds
        );


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (
                seconds % 3600
            ) / 60
        );


    const remaining =
        seconds % 60;


    if (hours > 0) {

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
    }


    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}


function formatDuration(
    seconds
) {

    return formatTime(
        seconds
    );
}


/* ============================================================
   ANALYTICS INITIALIZATION
   ============================================================ */

function initializeAnalytics() {

    const stored =
        localStorage.getItem(
            CONFIG.storageKey
        );


    if (!stored) {

        analytics = {
            sessions: [],
            media: {},
            daily: {}
        };


        saveAnalytics();

        return;
    }


    try {

        analytics =
            JSON.parse(
                stored
            );

    } catch (error) {

        analytics = {
            sessions: [],
            media: {},
            daily: {}
        };


        saveAnalytics();
    }
}


/* ============================================================
   ANALYTICS SAVE
   ============================================================ */

function saveAnalytics() {

    try {

        localStorage.setItem(
            CONFIG.storageKey,
            JSON.stringify(
                analytics
            )
        );

    } catch (error) {

        console.error(
            "Archive analytics save failed:",
            error
        );
    }
}


/* ============================================================
   MEDIA STATS
   ============================================================ */

function ensureMediaStats(
    media
) {

    if (!analytics.media) {
        analytics.media = {};
    }


    if (
        !analytics.media[
            media.id
        ]
    ) {

        analytics.media[
            media.id
        ] = {

            id:
                media.id,

            type:
                media.type,

            name:
                media.name,

            file:
                media.file,

            totalWatchTime:
                0,

            totalViews:
                0,

            monthly:
                {},

            monthlyViews:
                {}
        };
    }


    const stats =
        analytics.media[
            media.id
        ];


    if (
        typeof stats.totalWatchTime !==
        "number"
    ) {

        stats.totalWatchTime =
            0;
    }


    if (
        typeof stats.totalViews !==
        "number"
    ) {

        stats.totalViews =
            0;
    }


    if (
        !stats.monthly ||
        typeof stats.monthly !==
        "object"
    ) {

        stats.monthly =
            {};
    }


    if (
        !stats.monthlyViews ||
        typeof stats.monthlyViews !==
        "object"
    ) {

        stats.monthlyViews =
            {};
    }


    return stats;
}


function incrementMediaOpen(
    media
) {

    const stats =
        ensureMediaStats(
            media
        );


    const month =
        getMonthKey();


    stats.totalViews +=
        1;


    stats.monthlyViews[month] =
        normalizeSeconds(
            stats.monthlyViews[month]
        ) + 1;


    saveAnalytics();
}


/* ============================================================
   SESSION START
   ============================================================ */

function startSession() {

    stopMediaTimer();


    state.sessionStarted =
        true;


    state.sessionStartTime =
        Date.now();


    state.mediaStartTime =
        Date.now();


    state.mediaElapsedSeconds =
        0;


    state.currentMediaWatchTime =
        0;


    startMediaTimer();
}


/* ============================================================
   CURRENT MEDIA TIME COMMIT
   ============================================================ */

function commitCurrentMediaTime() {

    if (
        !state.sessionStarted ||
        !state.mediaStartTime
    ) {
        return;
    }


    const elapsed =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now() -
                    state.mediaStartTime
                ) / 1000
            )
        );


    state.currentMediaWatchTime =
        elapsed;


    const media =
        getMedia(
            state.currentMediaIndex
        );


    if (!media) {
        return;
    }


    const stats =
        ensureMediaStats(
            media
        );


    if (
        elapsed > 0
    ) {

        const month =
            getMonthKey();


        stats.totalWatchTime +=
            elapsed;


        stats.monthly[month] =
            normalizeSeconds(
                stats.monthly[month]
            ) + elapsed;
    }


    state.mediaElapsedSeconds =
        0;


    state.currentMediaWatchTime =
        0;


    state.mediaStartTime =
        Date.now();


    saveAnalytics();
}


/* ============================================================
   SESSION END
   ============================================================ */

function endSession() {

    if (
        !state.sessionStarted
    ) {
        return;
    }


    commitCurrentMediaTime();


    const sessionEnd =
        Date.now();


    const duration =
        Math.max(
            0,
            Math.floor(
                (
                    sessionEnd -
                    state.sessionStartTime
                ) / 1000
            )
        );


    const startedAt =
        new Date(
            state.sessionStartTime
        );


    const sessionDate =
        startedAt
            .toISOString()
            .slice(
                0,
                10
            );


    const session = {

        id:
            createSessionId(),

        startTime:
            state.sessionStartTime,

        endTime:
            sessionEnd,

        startedAt:
            startedAt.toISOString(),

        endedAt:
            new Date(
                sessionEnd
            ).toISOString(),

        date:
            sessionDate,

        mediaOpened:
            state.currentMediaIndex + 1,

        uniqueMedia:
            getSessionUniqueMedia(),

        watchTime:
            duration,

        duration:
            duration
    };


    if (
        !Array.isArray(
            analytics.sessions
        )
    ) {

        analytics.sessions =
            [];
    }


    analytics.sessions.push(
        session
    );


    if (!analytics.daily) {
        analytics.daily = {};
    }


    if (
        !analytics.daily[
            sessionDate
        ]
    ) {

        analytics.daily[
            sessionDate
        ] = {

            time:
                0,

            sessions:
                0,

            mediaOpened:
                0
        };
    }


    analytics.daily[
        sessionDate
    ].time +=
        duration;


    analytics.daily[
        sessionDate
    ].sessions +=
        1;


    analytics.daily[
        sessionDate
    ].mediaOpened +=
        session.mediaOpened;


    saveAnalytics();


    state.sessionStarted =
        false;


    state.sessionStartTime =
        null;


    state.mediaStartTime =
        null;


    state.mediaElapsedSeconds =
        0;


    state.currentMediaWatchTime =
        0;


    stopMediaTimer();
}


/* ============================================================
   SESSION UNIQUE MEDIA
   ============================================================ */

function getSessionUniqueMedia() {

    return mediaLibrary
        .slice(
            0,
            state.currentMediaIndex + 1
        )
        .map(
            media =>
                media.id
        );
}


/* ============================================================
   SESSION ID
   ============================================================ */

function createSessionId() {

    return `session-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}


/* ============================================================
   VOLUME CONTROLS
   ============================================================ */

function setupVolumeControls() {

    if (
        elements.volumeSlider
    ) {

        elements.volumeSlider.value =
            String(
                state.volume
            );


        on(
            elements.volumeSlider,
            "input",
            event => {

                const value =
                    Number(
                        event.target.value
                    );


                state.volume =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            value
                        )
                    );


                if (
                    state.volume > 0
                ) {

                    state.muted =
                        false;
                }


                applyVolume();
            }
        );
    }


    on(
        elements.muteButton,
        "click",
        toggleMute
    );


    on(
        elements.volumeButton,
        "click",
        event => {

            event.stopPropagation();


            if (
                elements.volumePopup
            ) {

                elements.volumePopup.classList.toggle(
                    "active"
                );
            }
        }
    );
}


function toggleMute() {

    state.muted =
        !state.muted;


    applyVolume();
}


function setVolume(
    value
) {

    state.volume =
        Math.max(
            0,
            Math.min(
                1,
                Number(value) || 0
            )
        );


    if (
        state.volume > 0
    ) {

        state.muted =
            false;
    }


    applyVolume();
}


function applyVolume() {

    if (
        elements.backgroundAudio
    ) {

        elements.backgroundAudio.volume =
            state.muted
                ? 0
                : state.volume;
    }


    const video =
        elements.mediaWrapper
            ?.querySelector(
                "video"
            );


    if (video) {

        video.volume =
            state.muted
                ? 0
                : state.volume;


        video.muted =
            state.muted;
    }


    if (
        elements.volumeSlider
    ) {

        elements.volumeSlider.value =
            String(
                state.muted
                    ? 0
                    : state.volume
            );
    }
}


/* ============================================================
   ZOOM CONTROLS
   ============================================================ */

function setupZoomControls() {

    if (
        elements.zoomSlider
    ) {

        elements.zoomSlider.value =
            String(
                state.zoom
            );


        on(
            elements.zoomSlider,
            "input",
            event => {

                state.zoom =
                    Number(
                        event.target.value
                    );


                applyZoom();
            }
        );
    }


    on(
        elements.zoomButton,
        "click",
        () => {

            state.zoom =
                state.zoom >= 2
                    ? 1
                    : Math.min(
                        2,
                        state.zoom + 0.25
                    );


            applyZoom();
        }
    );
}


function setZoom(
    value
) {

    state.zoom =
        Math.max(
            1,
            Math.min(
                2,
                Number(value) || 1
            )
        );


    applyZoom();
}


function applyZoom() {

    const media =
        elements.mediaWrapper
            ?.querySelector(
                ".viewer-image, .viewer-video"
            );


    if (!media) {
        return;
    }


    media.style.transform =
        `scale(${state.zoom})`;


    updateZoomUI();
}


function updateZoomUI() {

    if (
        elements.zoomSlider
    ) {

        elements.zoomSlider.value =
            String(
                state.zoom
            );
    }
}


/* ============================================================
   FULLSCREEN
   ============================================================ */

function setupFullscreen() {

    if (
        !elements.fullscreenButton
    ) {
        return;
    }


    on(
        elements.fullscreenButton,
        "click",
        async () => {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await document.documentElement
                        .requestFullscreen();

                } else {

                    await document.exitFullscreen();
                }

            } catch (error) {

                console.warn(
                    "Fullscreen unavailable:",
                    error
                );
            }
        }
    );
}


/* ============================================================
   DASHBOARD BUTTON
   ============================================================ */

function setupDashboardButton() {

    on(
        elements.openDashboard,
        "click",
        openDashboard
    );
}


/* ============================================================
   OPEN DASHBOARD
   ============================================================ */

function openDashboard() {

    if (
        state.sessionStarted
    ) {

        endSession();

    } else {

        commitCurrentMediaTime();
    }


    state.dashboardReturnScreen =
        "viewer";


    renderDashboard();


    showScreen(
        "dashboard"
    );
}


/* ============================================================
   DASHBOARD INITIALIZATION
   ============================================================ */

function initializeDashboard() {

    on(
        elements.dashboardBack,
        "click",
        backToViewer
    );


    on(
        elements.monthSelector,
        "change",
        event => {

            state.selectedDashboardMonth =
                event.target.value;


            renderDashboard();
        }
    );
}


/* ============================================================
   BACK TO VIEWER
   ============================================================ */

function backToViewer() {

    renderDashboard();


    showScreen(
        "viewer"
    );


    window.setTimeout(
        () => {

            if (
                !state.sessionStarted
            ) {

                startSession();
            }


            loadMedia(
                state.currentMediaIndex,
                true
            );

        },
        CONFIG.transitionDuration + 40
    );
}


/* ============================================================
   MONTH HELPERS
   ============================================================ */

function getMonthKey(
    date = new Date()
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}`;
}


function formatMonth(
    monthKey
) {

    if (!monthKey) {
        return "—";
    }


    const [
        year,
        month
    ] =
        monthKey.split(
            "-"
        );


    const date =
        new Date(
            Number(year),
            Number(month) - 1,
            1
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return monthKey;
    }


    return date.toLocaleDateString(
        undefined,
        {
            month: "long",
            year: "numeric"
        }
    );
}


/* ============================================================
   MONTH SELECTOR
   ============================================================ */

function initializeMonthSelector() {

    if (
        !elements.monthSelector
    ) {
        return;
    }


    const months =
        new Set();


    months.add(
        getMonthKey()
    );


    analytics.sessions.forEach(
        session => {

            const date =
                session.date ||
                (
                    session.startedAt
                        ? session.startedAt.slice(
                            0,
                            7
                        )
                        : null
                );


            if (date) {

                months.add(
                    date.slice(
                        0,
                        7
                    )
                );
            }
        }
    );


    Object.values(
        analytics.media || {}
    ).forEach(
        stats => {

            Object.keys(
                stats.monthly || {}
            ).forEach(
                month => {

                    months.add(
                        month
                    );
                }
            );
        }
    );


    const sorted =
        [...months]
            .sort()
            .reverse();


    elements.monthSelector.innerHTML =
        "";


    sorted.forEach(
        month => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                month;


            option.textContent =
                formatMonth(
                    month
                );


            elements.monthSelector.appendChild(
                option
            );
        }
    );


    const selected =
        state.selectedDashboardMonth;


    if (
        selected &&
        months.has(
            selected
        )
    ) {

        elements.monthSelector.value =
            selected;

    } else {

        elements.monthSelector.value =
            getMonthKey();


        state.selectedDashboardMonth =
            elements.monthSelector.value;
    }
}


/* ============================================================
   DASHBOARD RENDER
   ============================================================ */

function renderDashboard() {

    initializeMonthSelector();


    const monthKey =
        elements.monthSelector?.value ||
        state.selectedDashboardMonth ||
        getMonthKey();


    state.selectedDashboardMonth =
        monthKey;


    if (
        elements.currentMonthLabel
    ) {

        elements.currentMonthLabel.textContent =
            formatMonth(
                monthKey
            );
    }


    renderMonthlyAnalytics(
        monthKey
    );


    renderLifetimeAnalytics();
}


/* ============================================================
   MONTHLY SESSION DATA
   ============================================================ */

function getMonthSessions(
    monthKey
) {

    return (
        analytics.sessions || []
    ).filter(
        session => {

            const date =
                session.date ||
                (
                    session.startedAt
                        ? session.startedAt.slice(
                            0,
                            7
                        )
                        : null
                );


            return (
                date &&
                date.startsWith(
                    monthKey
                )
            );
        }
    );
}


/* ============================================================
   DAILY WATCH TIMES
   ============================================================ */

function getDailyWatchTimes(
    monthKey
) {

    const daily = {};


    getMonthSessions(
        monthKey
    ).forEach(
        session => {

            const date =
                session.date ||
                session.startedAt?.slice(
                    0,
                    10
                );


            if (!date) {
                return;
            }


            daily[date] =
                normalizeSeconds(
                    daily[date]
                ) +
                normalizeSeconds(
                    session.watchTime ??
                    session.duration
                );
        }
    );


    return daily;
}


/* ============================================================
   DAILY SESSION COUNTS
   ============================================================ */

function getDailySessionCounts(
    monthKey
) {

    const daily = {};


    getMonthSessions(
        monthKey
    ).forEach(
        session => {

            const date =
                session.date ||
                session.startedAt?.slice(
                    0,
                    10
                );


            if (!date) {
                return;
            }


            daily[date] =
                normalizeSeconds(
                    daily[date]
                ) + 1;
        }
    );


    return daily;
}


/* ============================================================
   FIND EXTREME
   ============================================================ */

function findExtreme(
    values,
    mode = "highest"
) {

    const entries =
        Object.entries(
            values || {}
        );


    if (!entries.length) {

        return {
            key: null,
            value: 0
        };
    }


    let result =
        entries[0];


    for (
        const entry of entries
    ) {

        const value =
            Number(
                entry[1]
            ) || 0;


        const current =
            Number(
                result[1]
            ) || 0;


        if (
            mode === "highest" &&
            value > current
        ) {

            result =
                entry;
        }


        if (
            mode === "lowest" &&
            value < current
        ) {

            result =
                entry;
        }
    }


    return {

        key:
            result[0],

        value:
            Number(
                result[1]
            ) || 0
    };
}


/* ============================================================
   MOST WATCHED MEDIA
   ============================================================ */

function getMostWatchedMedia(
    type,
    monthKey = null
) {

    const library =
        type === "photo"
            ? photos
            : videos;


    let winner =
        null;


    let bestTime =
        0;


    for (
        const media of library
    ) {

        const stats =
            analytics.media[
                media.id
            ];


        if (!stats) {
            continue;
        }


        const time =
            monthKey
                ? normalizeSeconds(
                    stats.monthly?.[
                        monthKey
                    ]
                )
                : normalizeSeconds(
                    stats.totalWatchTime
                );


        if (
            time > bestTime
        ) {

            bestTime =
                time;


            winner =
                media;
        }
    }


    return {

        media:
            winner,

        time:
            bestTime
    };
}


/* ============================================================
   MOST VIEWED MEDIA
   ============================================================ */

function getMostViewedMedia(
    type,
    monthKey = null
) {

    const library =
        type === "photo"
            ? photos
            : videos;


    let winner =
        null;


    let bestViews =
        0;


    for (
        const media of library
    ) {

        const stats =
            analytics.media[
                media.id
            ];


        if (!stats) {
            continue;
        }


        const views =
            monthKey
                ? normalizeSeconds(
                    stats.monthlyViews?.[
                        monthKey
                    ]
                )
                : normalizeSeconds(
                    stats.totalViews
                );


        if (
            views > bestViews
        ) {

            bestViews =
                views;


            winner =
                media;
        }
    }


    return {

        media:
            winner,

        views:
            bestViews
    };
}


/* ============================================================
   MONTHLY ANALYTICS
   ============================================================ */

function renderMonthlyAnalytics(
    monthKey
) {

    const sessions =
        getMonthSessions(
            monthKey
        );


    const dailyWatch =
        getDailyWatchTimes(
            monthKey
        );


    const dailySessions =
        getDailySessionCounts(
            monthKey
        );


    const totalWatchTime =
        sessions.reduce(
            (
                sum,
                session
            ) =>
                sum +
                normalizeSeconds(
                    session.watchTime ??
                    session.duration
                ),
            0
        );


    const highestTime =
        findExtreme(
            dailyWatch,
            "highest"
        );


    const lowestTime =
        findExtreme(
            dailyWatch,
            "lowest"
        );


    const highestSession =
        findExtreme(
            dailySessions,
            "highest"
        );


    const lowestSession =
        findExtreme(
            dailySessions,
            "lowest"
        );


    const averageTime =
        sessions.length
            ? totalWatchTime /
              sessions.length
            : 0;


    const mostWatchedPhoto =
        getMostWatchedMedia(
            "photo",
            monthKey
        );


    const mostWatchedVideo =
        getMostWatchedMedia(
            "video",
            monthKey
        );


    setText(
        "monthly-highest-time",
        highestTime.key
            ? formatTime(
                highestTime.value
            )
            : "—"
    );


    setText(
        "monthly-highest-time-date",
        highestTime.key
            ? formatDate(
                highestTime.key
            )
            : "No data"
    );


    setText(
        "monthly-lowest-time",
        lowestTime.key
            ? formatTime(
                lowestTime.value
            )
            : "—"
    );


    setText(
        "monthly-lowest-time-date",
        lowestTime.key
            ? formatDate(
                lowestTime.key
            )
            : "No data"
    );


    setText(
        "monthly-average-time",
        sessions.length
            ? formatTime(
                averageTime
            )
            : "—"
    );


    setText(
        "monthly-most-watched-video",
        mostWatchedVideo.media
            ? mostWatchedVideo.media.name
            : "No data"
    );


    setText(
        "monthly-most-watched-video-time",
        mostWatchedVideo.media
            ? formatTime(
                mostWatchedVideo.time
            )
            : "—"
    );


    setText(
        "monthly-most-watched-photo",
        mostWatchedPhoto.media
            ? mostWatchedPhoto.media.name
            : "No data"
    );


    setText(
        "monthly-most-watched-photo-time",
        mostWatchedPhoto.media
            ? formatTime(
                mostWatchedPhoto.time
            )
            : "—"
    );


    setText(
        "monthly-total-sessions",
        sessions.length
    );


    setText(
        "monthly-highest-session",
        highestSession.key
            ? `${highestSession.value} sessions`
            : "—"
    );


    setText(
        "monthly-highest-session-date",
        highestSession.key
            ? formatDate(
                highestSession.key
            )
            : "No data"
    );


    setText(
        "monthly-lowest-session",
        lowestSession.key
            ? `${lowestSession.value} sessions`
            : "—"
    );


    setText(
        "monthly-lowest-session-date",
        lowestSession.key
            ? formatDate(
                lowestSession.key
            )
            : "No data"
    );


    setText(
        "monthly-total-watch-time",
        formatTime(
            totalWatchTime
        )
    );


    renderMostWatchedMedia(
        "monthly-most-watched-photo-media",
        mostWatchedPhoto.media,
        mostWatchedPhoto.time
    );


    renderMostWatchedMedia(
        "monthly-most-watched-video-media",
        mostWatchedVideo.media,
        mostWatchedVideo.time
    );
}


/* ============================================================
   LIFETIME ANALYTICS
   ============================================================ */

function renderLifetimeAnalytics() {

    const sessions =
        analytics.sessions || [];


    const totalSessions =
        sessions.length;


    const totalWatchTime =
        Object.values(
            analytics.media || {}
        ).reduce(
            (
                sum,
                stats
            ) =>
                sum +
                normalizeSeconds(
                    stats.totalWatchTime
                ),
            0
        );


    const mostWatchedPhoto =
        getMostWatchedMedia(
            "photo"
        );


    const mostWatchedVideo =
        getMostWatchedMedia(
            "video"
        );


    const dailyWatch =
        {};


    const dailySessions =
        {};


    sessions.forEach(
        session => {

            const date =
                session.date ||
                session.startedAt?.slice(
                    0,
                    10
                );


            if (!date) {
                return;
            }


            dailyWatch[date] =
                normalizeSeconds(
                    dailyWatch[date]
                ) +
                normalizeSeconds(
                    session.watchTime ??
                    session.duration
                );


            dailySessions[date] =
                normalizeSeconds(
                    dailySessions[date]
                ) + 1;
        }
    );


    const highestSession =
        findExtreme(
            dailySessions,
            "highest"
        );


    const highestWatch =
        findExtreme(
            dailyWatch,
            "highest"
        );


    setText(
        "lifetime-total-hours",
        formatLifetimeHours(
            totalWatchTime
        )
    );


    setText(
        "lifetime-watch-hours",
        formatLifetimeHours(
            totalWatchTime
        )
    );


    setText(
        "lifetime-watch-time",
        formatLifetimeHours(
            totalWatchTime
        )
    );


    setText(
        "lifetime-most-watched-photo",
        mostWatchedPhoto.media
            ? mostWatchedPhoto.media.name
            : "No data"
    );


    setText(
        "lifetime-most-watched-photo-time",
        mostWatchedPhoto.media
            ? formatTime(
                mostWatchedPhoto.time
            )
            : "—"
    );


    setText(
        "lifetime-most-watched-video",
        mostWatchedVideo.media
            ? mostWatchedVideo.media.name
            : "No data"
    );


    setText(
        "lifetime-most-watched-video-time",
        mostWatchedVideo.media
            ? formatTime(
                mostWatchedVideo.time
            )
            : "—"
    );


    setText(
        "lifetime-total-sessions",
        totalSessions
    );


    setText(
        "lifetime-sessions",
        totalSessions
    );


    setText(
        "lifetime-time-spend",
        formatLifetimeHours(
            totalWatchTime
        )
    );


    setText(
        "lifetime-highest-session",
        highestSession.key
            ? `${highestSession.value} sessions`
            : "—"
    );


    setText(
        "lifetime-highest-session-date",
        highestSession.key
            ? formatDate(
                highestSession.key
            )
            : "No data"
    );


    setText(
        "lifetime-highest-time",
        highestWatch.key
            ? formatTime(
                highestWatch.value
            )
            : "—"
    );


    setText(
        "lifetime-highest-time-date",
        highestWatch.key
            ? formatDate(
                highestWatch.key
            )
            : "No data"
    );


    renderMostWatchedMedia(
        "lifetime-most-watched-photo-media",
        mostWatchedPhoto.media,
        mostWatchedPhoto.time
    );


    renderMostWatchedMedia(
        "lifetime-most-watched-video-media",
        mostWatchedVideo.media,
        mostWatchedVideo.time
    );
}


/* ============================================================
   LIFETIME HOURS
   ============================================================ */

function formatLifetimeHours(
    seconds
) {

    seconds =
        normalizeSeconds(
            seconds
        );


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (
                seconds % 3600
            ) / 60
        );


    if (
        hours > 0
    ) {

        return `${hours}h ${minutes}m`;
    }


    return `${minutes}m`;
}


/* ============================================================
   DASHBOARD MEDIA PREVIEW
   ============================================================ */

function renderMostWatchedMedia(
    containerId,
    media,
    watchTime
) {

    const container =
        $(containerId);


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (!media) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "dashboard-empty";


        empty.textContent =
            "No data yet";


        container.appendChild(
            empty
        );


        return;
    }


    let element;


    if (
        media.type === "photo"
    ) {

        element =
            document.createElement(
                "img"
            );


        element.src =
            media.path;


        element.alt =
            media.name;


        element.className =
            "most-watched-media-image";


        element.loading =
            "lazy";

    } else {

        element =
            document.createElement(
                "video"
            );


        element.src =
            media.path;


        element.className =
            "most-watched-media-video";


        element.autoplay =
            true;


        element.loop =
            true;


        element.muted =
            true;


        element.defaultMuted =
            true;


        element.playsInline =
            true;


        element.controls =
            false;


        element.preload =
            "metadata";


        on(
            element,
            "loadeddata",
            () => {

                element.play().catch(
                    () => {}
                );
            }
        );
    }


    container.appendChild(
        element
    );


    const time =
        document.createElement(
            "span"
        );


    time.className =
        "most-watched-time";


    time.textContent =
        formatTime(
            watchTime
        );


    container.appendChild(
        time
    );
}


/* ============================================================
   TEXT HELPERS
   ============================================================ */

function setText(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.textContent =
            String(
                value
            );
    }
}


function formatDate(
    value
) {

    if (!value) {
        return "—";
    }


    let date;


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            String(value)
        )
    ) {

        const [
            year,
            month,
            day
        ] =
            String(value).split(
                "-"
            );


        date =
            new Date(
                Number(year),
                Number(month) - 1,
                Number(day)
            );

    } else {

        date =
            new Date(
                value
            );
    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";
    }


    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* ============================================================
   HTML ESCAPE
   ============================================================ */

function escapeHtml(
    value
) {

    return String(
        value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}
    on(
        element,
        "error",
        () => {
            showMediaError(
                media
            );
        }
    );
}


/* =========================================================
   CLEANUP CURRENT MEDIA
========================================================= */

function cleanupCurrentMediaElement() {
    const element =
        state.currentMediaElement;

    if (!element) {
        return;
    }

    try {
        if (
            element.tagName ===
            "VIDEO"
        ) {
            element.pause();

            element.removeAttribute(
                "src"
            );

            element.load();
        }
    } catch (error) {
        console.warn(
            "Media cleanup failed.",
            error
        );
    }

    state.currentMediaElement =
        null;
}


/* =========================================================
   MEDIA ERROR
========================================================= */

function showMediaError(media) {
    if (!mediaWrapper) {
        return;
    }

    let message =
        media.type === "photo"
            ? "Photo could not be loaded."
            : "Video could not be loaded.";

    const existing =
        mediaWrapper.querySelector(
            ".media-error-message"
        );

    if (existing) {
        existing.remove();
    }

    const error =
        document.createElement(
            "div"
        );

    error.className =
        "media-error-message";

    error.textContent =
        `${message} ${media.file}`;

    mediaWrapper.appendChild(
        error
    );
}


/* =========================================================
   PREVIOUS MEDIA
========================================================= */

function previousMedia() {
    if (!mediaLibrary.length) {
        return;
    }

    commitCurrentMediaTime();

    let nextIndex =
        state.currentMediaIndex - 1;

    if (nextIndex < 0) {
        nextIndex =
            mediaLibrary.length - 1;
    }

    loadMedia(
        nextIndex
    );
}


/* =========================================================
   NEXT MEDIA
========================================================= */

function nextMedia() {
    if (!mediaLibrary.length) {
        return;
    }

    commitCurrentMediaTime();

    let nextIndex =
        state.currentMediaIndex + 1;

    if (
        nextIndex >=
        mediaLibrary.length
    ) {
        nextIndex = 0;
    }

    loadMedia(
        nextIndex
    );
}


/* =========================================================
   ZOOM
========================================================= */

function setZoom(value) {
    state.zoom =
        clamp(
            Number(value) || 1,
            CONFIG.minZoom,
            CONFIG.maxZoom
        );

    if (zoomSlider) {
        zoomSlider.value =
            String(state.zoom);
    }

    applyZoom();
}


function applyZoom() {
    if (
        !state.currentMediaElement
    ) {
        return;
    }

    state.currentMediaElement.style.transform =
        `scale(${state.zoom})`;

    state.currentMediaElement.style.transformOrigin =
        "center center";
}


/* =========================================================
   VOLUME
========================================================= */

function setVolume(value) {
    state.volume =
        clamp(
            Number(value) || 0,
            0,
            1
        );

    /*
       If user manually moves volume,
       unmute automatically.
    */

    if (state.volume > 0) {
        state.muted =
            false;
    }

    if (volumeSlider) {
        volumeSlider.value =
            String(state.volume);
    }

    applyAudioSettings();

    if (state.previewAudio) {
        state.previewAudio.volume =
            state.volume;

        state.previewAudio.muted =
            state.muted;
    }

    updateVolumeUI();

    savePreferences();
}


/* =========================================================
   TOGGLE MUTE
========================================================= */

function toggleMute() {
    state.muted =
        !state.muted;

    applyAudioSettings();

    if (state.previewAudio) {
        state.previewAudio.muted =
            state.muted;
    }

    updateVolumeUI();

    savePreferences();
}


/* =========================================================
   VOLUME UI
========================================================= */

function updateVolumeUI() {
    if (volumeSlider) {
        volumeSlider.value =
            String(state.volume);
    }

    if (muteButton) {
        muteButton.setAttribute(
            "aria-label",
            state.muted
                ? "Unmute"
                : "Mute"
        );

        muteButton.classList.toggle(
            "muted",
            state.muted
        );
    }

    if (volumeButton) {
        volumeButton.setAttribute(
            "aria-label",
            state.muted
                ? "Unmute"
                : "Mute"
        );

        volumeButton.classList.toggle(
            "muted",
            state.muted
        );
    }

    if (volumeControl) {
        volumeControl.classList.toggle(
            "is-muted",
            state.muted
        );
    }
}


/* =========================================================
   FULLSCREEN
========================================================= */

async function toggleFullscreen() {
    try {
        if (
            !document.fullscreenElement
        ) {
            const target =
                viewerScreen ||
                document.documentElement;

            if (
                target.requestFullscreen
            ) {
                await target.requestFullscreen();
            }
        } else {
            if (
                document.exitFullscreen
            ) {
                await document.exitFullscreen();
            }
        }
    } catch (error) {
        console.warn(
            "Fullscreen unavailable:",
            error
        );
    }
}


/* =========================================================
   VIEWER UI
========================================================= */

function updateViewerUI() {
    const media =
        getMedia(
            state.currentMediaIndex
        );

    if (!media) {
        return;
    }

    if (currentMediaName) {
        currentMediaName.textContent =
            media.name;
    }

    if (mediaPosition) {
        mediaPosition.textContent =
            `${state.currentMediaIndex + 1} / ${mediaLibrary.length}`;
    }

    if (mediaWatchTime) {
        mediaWatchTime.textContent =
            formatClock(
                state.mediaElapsedSeconds
            );
    }

    if (zoomSlider) {
        zoomSlider.min =
            String(CONFIG.minZoom);

        zoomSlider.max =
            String(CONFIG.maxZoom);

        zoomSlider.step =
            String(CONFIG.zoomStep);

        zoomSlider.value =
            String(state.zoom);
    }
}


/* =========================================================
   MEDIA TIMER
========================================================= */

function startMediaTimer() {
    stopMediaTimer();

    state.mediaStartTimestamp =
        Date.now();

    state.mediaElapsedSeconds =
        0;

    updateViewerTimer();

    state.timerInterval =
        window.setInterval(
            () => {
                if (
                    !state.pageVisible ||
                    !state.sessionStarted
                ) {
                    return;
                }

                state.mediaElapsedSeconds++;

                updateViewerTimer();

                /*
                   Commit periodically rather than waiting
                   until navigation.
                */

                if (
                    state.mediaElapsedSeconds % 5 ===
                    0
                ) {
                    commitCurrentMediaTime(
                        false
                    );

                    state.mediaStartTimestamp =
                        Date.now();
                }
            },
            CONFIG.timerInterval
        );
}


/* =========================================================
   UPDATE TIMER UI
========================================================= */

function updateViewerTimer() {
    if (mediaWatchTime) {
        mediaWatchTime.textContent =
            formatClock(
                state.mediaElapsedSeconds
            );
    }
}


/* =========================================================
   STOP MEDIA TIMER
========================================================= */

function stopMediaTimer() {
    if (
        state.timerInterval
    ) {
        window.clearInterval(
            state.timerInterval
        );

        state.timerInterval =
            null;
    }
}


/* =========================================================
   ENSURE MEDIA ANALYTICS
========================================================= */

function ensureMediaAnalytics(media) {
    if (!media) {
        return null;
    }

    if (
        !analytics.media[media.id]
    ) {
        analytics.media[media.id] = {
            totalWatchTime: 0,
            totalViews: 0,

            monthly: {},
            monthlyViews: {}
        };
    }

    const stats =
        analytics.media[media.id];


    if (
        !stats.monthly ||
        typeof stats.monthly !==
        "object"
    ) {
        stats.monthly = {};
    }


    if (
        !stats.monthlyViews ||
        typeof stats.monthlyViews !==
        "object"
    ) {
        stats.monthlyViews = {};
    }


    stats.totalWatchTime =
        normalizeSeconds(
            stats.totalWatchTime
        );

    stats.totalViews =
        normalizeSeconds(
            stats.totalViews
        );

    return stats;
}


/* =========================================================
   REGISTER MEDIA OPEN
========================================================= */

function registerMediaOpen(media) {
    if (!media) {
        return;
    }

    const stats =
        ensureMediaAnalytics(
            media
        );

    const monthKey =
        getMonthKey();

    stats.totalViews++;

    stats.monthlyViews[monthKey] =
        normalizeSeconds(
            stats.monthlyViews[monthKey]
        ) + 1;


    if (
        state.currentSession
    ) {
        state.currentSession.mediaOpened++;

        if (
            !state.currentSession.uniqueMedia.includes(
                media.id
            )
        ) {
            state.currentSession.uniqueMedia.push(
                media.id
            );
        }
    }

    saveAnalytics();
}


/* =========================================================
   COMMIT CURRENT MEDIA TIME
========================================================= */

function commitCurrentMediaTime(
    save = true
) {
    if (
        !state.currentSession
    ) {
        return;
    }

    const seconds =
        normalizeSeconds(
            state.mediaElapsedSeconds
        );

    if (seconds <= 0) {
        return;
    }

    const media =
        getMedia(
            state.currentMediaIndex
        );

    if (!media) {
        return;
    }

    const stats =
        ensureMediaAnalytics(
            media
        );

    const monthKey =
        getMonthKey();

    stats.totalWatchTime +=
        seconds;

    stats.monthly[monthKey] =
        normalizeSeconds(
            stats.monthly[monthKey]
        ) + seconds;


    state.currentSession.watchTime +=
        seconds;


    state.mediaElapsedSeconds =
        0;

    state.mediaStartTimestamp =
        Date.now();


    if (save) {
        saveAnalytics();
    }
}


/* =========================================================
   VISIBILITY HANDLING
========================================================= */

function handleVisibilityChange() {
    state.pageVisible =
        !document.hidden;

    if (
        document.hidden
    ) {
        commitCurrentMediaTime();

        saveAnalytics();

        savePreferences();
    } else {
        if (
            state.sessionStarted
        ) {
            state.mediaStartTimestamp =
                Date.now();
        }
    }
}


/* =========================================================
   PAGE EXIT
========================================================= */

function handlePageExit() {
    commitCurrentMediaTime();

    saveAnalytics();

    savePreferences();
}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

function handleKeyboard(event) {

    /*
       Do not hijack keyboard input fields.
    */

    const target =
        event.target;

    if (
        target &&
        (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable
        )
    ) {
        return;
    }


    if (
        state.currentScreen !==
        "viewer"
    ) {
        return;
    }


    switch (event.key) {

        case "ArrowRight":
            event.preventDefault();
            nextMedia();
            break;

        case "ArrowLeft":
            event.preventDefault();
            previousMedia();
            break;

        case "+":
        case "=":
            event.preventDefault();

            setZoom(
                state.zoom +
                CONFIG.zoomStep
            );

            break;

        case "-":
        case "_":
            event.preventDefault();

            setZoom(
                state.zoom -
                CONFIG.zoomStep
            );

            break;

        case "m":
        case "M":
            event.preventDefault();
            toggleMute();
            break;

        case "f":
        case "F":
            event.preventDefault();
            toggleFullscreen();
            break;

        case "Escape":
            if (
                document.fullscreenElement
            ) {
                document.exitFullscreen()
                    .catch(() => {});
            }
            break;
    }
}


/* =========================================================
   DASHBOARD NAVIGATION
========================================================= */

function openDashboard() {
    commitCurrentMediaTime();

    state.dashboardReturnScreen =
        "viewer";

    renderDashboard();

    showScreen(
        "dashboard"
    );
}


function backToViewer() {
    renderDashboard();

    showScreen(
        "viewer"
    );

    window.setTimeout(() => {

        /*
           Do not register another media view.
           Just restore the current media.
        */

        loadMedia(
            state.currentMediaIndex
        );

    }, CONFIG.transitionDuration + 40);
}


/* =========================================================
   MONTH SELECTOR
========================================================= */

function initializeMonthSelector() {
    if (!monthSelector) {
        return;
    }

    const months =
        new Set();

    months.add(
        getMonthKey()
    );


    analytics.sessions.forEach(
        session => {
            if (session.date) {
                months.add(
                    session.date.slice(
                        0,
                        7
                    )
                );
            }
        }
    );


    Object.values(
        analytics.media
    ).forEach(
        stats => {
            Object.keys(
                stats.monthly || {}
            ).forEach(
                month => {
                    months.add(
                        month
                    );
                }
            );
        }
    );


    const sorted =
        [...months]
            .sort()
            .reverse();


    monthSelector.innerHTML =
        "";


    sorted.forEach(
        month => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                month;

            option.textContent =
                formatMonth(
                    month
                );

            monthSelector.appendChild(
                option
            );
        }
    );


    if (
        months.has(
            state.selectedDashboardMonth
        )
    ) {
        monthSelector.value =
            state.selectedDashboardMonth;
    } else {
        monthSelector.value =
            getMonthKey();

        state.selectedDashboardMonth =
            monthSelector.value;
    }
}


/* =========================================================
   DASHBOARD RENDER
========================================================= */

function renderDashboard() {
    initializeMonthSelector();

    const monthKey =
        monthSelector?.value ||
        state.selectedDashboardMonth ||
        getMonthKey();

    state.selectedDashboardMonth =
        monthKey;

    if (currentMonthLabel) {
        currentMonthLabel.textContent =
            formatMonth(
                monthKey
            );
    }

    renderMonthlyAnalytics(
        monthKey
    );

    renderLifetimeAnalytics();
}


/* =========================================================
   MONTHLY SESSION DATA
========================================================= */

function getMonthSessions(monthKey) {
    return analytics.sessions.filter(
        session =>
            session.date &&
            session.date.startsWith(
                monthKey
            )
    );
}


/* =========================================================
   DAILY WATCH TIMES
========================================================= */

function getDailyWatchTimes(monthKey) {
    const daily = {};

    getMonthSessions(
        monthKey
    ).forEach(
        session => {
            const date =
                session.date;

            daily[date] =
                normalizeSeconds(
                    daily[date]
                ) +
                normalizeSeconds(
                    session.watchTime
                );
        }
    );

    return daily;
}


/* =========================================================
   DAILY SESSION COUNTS
========================================================= */

function getDailySessionCounts(monthKey) {
    const daily = {};

    getMonthSessions(
        monthKey
    ).forEach(
        session => {
            const date =
                session.date;

            daily[date] =
                normalizeSeconds(
                    daily[date]
                ) + 1;
        }
    );

    return daily;
}


/* =========================================================
   FIND EXTREME
========================================================= */

function findExtreme(
    values,
    mode = "highest"
) {
    const entries =
        Object.entries(
            values || {}
        );

    if (!entries.length) {
        return {
            key: null,
            value: 0
        };
    }

    let result =
        entries[0];


    for (
        const entry of entries
    ) {
        const value =
            Number(entry[1]) || 0;

        const current =
            Number(result[1]) || 0;


        if (
            mode === "highest" &&
            value > current
        ) {
            result =
                entry;
        }


        if (
            mode === "lowest" &&
            value < current
        ) {
            result =
                entry;
        }
    }


    return {
        key: result[0],
        value:
            Number(result[1]) || 0
    };
}


/* =========================================================
   MOST WATCHED MEDIA
========================================================= */

function getMostWatchedMedia(
    type,
    monthKey = null
) {
    const library =
        type === "photo"
            ? photos
            : videos;

    let winner = null;
    let bestTime = 0;

    for (
        const media of library
    ) {
        const stats =
            analytics.media[
                media.id
            ];

        if (!stats) {
            continue;
        }


        const time =
            monthKey
                ? normalizeSeconds(
                    stats.monthly?.[
                        monthKey
                    ]
                )
                : normalizeSeconds(
                    stats.totalWatchTime
                );


        if (
            time > bestTime
        ) {
            bestTime =
                time;

            winner =
                media;
        }
    }


    return {
        media: winner,
        time: bestTime
    };
}


/* =========================================================
   MOST VIEWED MEDIA
========================================================= */

function getMostViewedMedia(
    type,
    monthKey = null
) {
    const library =
        type === "photo"
            ? photos
            : videos;

    let winner = null;
    let bestViews = 0;

    for (
        const media of library
    ) {
        const stats =
            analytics.media[
                media.id
            ];

        if (!stats) {
            continue;
        }


        const views =
            monthKey
                ? normalizeSeconds(
                    stats.monthlyViews?.[
                        monthKey
                    ]
                )
                : normalizeSeconds(
                    stats.totalViews
                );


        if (
            views > bestViews
        ) {
            bestViews =
                views;

            winner =
                media;
        }
    }


    return {
        media: winner,
        views: bestViews
    };
}


/* =========================================================
   MONTHLY ANALYTICS
========================================================= */

function renderMonthlyAnalytics(
    monthKey
) {
    const sessions =
        getMonthSessions(
            monthKey
        );


    const dailyWatch =
        getDailyWatchTimes(
            monthKey
        );


    const dailySessions =
        getDailySessionCounts(
            monthKey
        );


    const totalWatchTime =
        sessions.reduce(
            (sum, session) =>
                sum +
                normalizeSeconds(
                    session.watchTime
                ),
            0
        );


    const highestTime =
        findExtreme(
            dailyWatch,
            "highest"
        );


    const lowestTime =
        findExtreme(
            dailyWatch,
            "lowest"
        );


    const highestSession =
        findExtreme(
            dailySessions,
            "highest"
        );


    const lowestSession =
        findExtreme(
            dailySessions,
            "lowest"
        );


    const averageTime =
        sessions.length
            ? totalWatchTime /
              sessions.length
            : 0;


    const mostWatchedPhoto =
        getMostWatchedMedia(
            "photo",
            monthKey
        );


    const mostWatchedVideo =
        getMostWatchedMedia(
            "video",
            monthKey
        );


    /* 1. Highest time */

    setText(
        "monthly-highest-time",
        highestTime.key
            ? formatTime(
                highestTime.value
            )
            : "—"
    );


    setText(
        "monthly-highest-time-date",
        highestTime.key
            ? formatDate(
                highestTime.key
            )
            : "No data"
    );


    /* 2. Lowest time */

    setText(
        "monthly-lowest-time",
        lowestTime.key
            ? formatTime(
                lowestTime.value
            )
            : "—"
    );


    setText(
        "monthly-lowest-time-date",
        lowestTime.key
            ? formatDate(
                lowestTime.key
            )
            : "No data"
    );


    /* 3. Average */

    setText(
        "monthly-average-time",
        sessions.length
            ? formatTime(
                averageTime
            )
            : "—"
    );


    /* 4. Most watched video */

    setText(
        "monthly-most-watched-video",
        mostWatchedVideo.media
            ? mostWatchedVideo.media.name
            : "No data"
    );


    setText(
        "monthly-most-watched-video-time",
        mostWatchedVideo.media
            ? formatTime(
                mostWatchedVideo.time
            )
            : "—"
    );


    /* 5. Most watched photo */

    setText(
        "monthly-most-watched-photo",
        mostWatchedPhoto.media
            ? mostWatchedPhoto.media.name
            : "No data"
    );


    setText(
        "monthly-most-watched-photo-time",
        mostWatchedPhoto.media
            ? formatTime(
                mostWatchedPhoto.time
            )
            : "—"
    );


    /* 6. Total sessions */

    setText(
        "monthly-total-sessions",
        sessions.length
    );


    /* 7. Highest sessions */

    setText(
        "monthly-highest-session",
        highestSession.key
            ? `${highestSession.value} sessions`
            : "—"
    );


    setText(
        "monthly-highest-session-date",
        highestSession.key
            ? formatDate(
                highestSession.key
            )
            : "No data"
    );


    /* 8. Lowest sessions */

    setText(
        "monthly-lowest-session",
        lowestSession.key
            ? `${lowestSession.value} sessions`
            : "—"
    );


    setText(
        "monthly-lowest-session-date",
        lowestSession.key
            ? formatDate(
                lowestSession.key
            )
            : "No data"
    );


    /* 9. Total watch time */

    setText(
        "monthly-total-watch-time",
        formatTime(
            totalWatchTime
        )
    );


    /*
       Render visual media previews
       if corresponding containers exist.
    */

    renderMostWatchedMedia(
        "monthly-most-watched-photo-media",
        mostWatchedPhoto.media,
        mostWatchedPhoto.time
    );


    renderMostWatchedMedia(
        "monthly-most-watched-video-media",
        mostWatchedVideo.media,
        mostWatchedVideo.time
    );
}


/* =========================================================
   LIFETIME ANALYTICS
========================================================= */

function renderLifetimeAnalytics() {

    const totalSessions =
        analytics.sessions.length;


    const totalWatchTime =
        analytics.sessions.reduce(
            (sum, session) =>
                sum +
                normalizeSeconds(
                    session.watchTime
                ),
            0
        );


    const mostWatchedPhoto =
        getMostWatchedMedia(
            "photo"
        );


    const mostWatchedVideo =
        getMostWatchedMedia(
            "video"
        );


    const dailyWatch = {};
    const dailySessions = {};


    analytics.sessions.forEach(
        session => {
            if (!session.date) {
                return;
            }


            dailyWatch[session.date] =
                normalizeSeconds(
                    dailyWatch[
                        session.date
                    ]
                ) +
                normalizeSeconds(
                    session.watchTime
                );


            dailySessions[session.date] =
                normalizeSeconds(
                    dailySessions[
                        session.date
                    ]
                ) + 1;
        }
    );


    const highestSession =
        findExtreme(
            dailySessions,
            "highest"
        );


    const highestWatch =
        findExtreme(
            dailyWatch,
            "highest"
        );


    /* 9. Total lifetime hours */

    setText(
        "lifetime-total-hours",
        formatLifetimeHours(
            totalWatchTime
        )
    );


    setText(
        "lifetime-watch-hours",
        formatLifetimeHours(
            totalWatchTime
        )
    );


    setText(
        "lifetime-watch-time",
        formatLifetimeHours(
            totalWatchTime
        )
    );


    /* 10. Most watched photo */

    setText(
        "lifetime-most-watched-photo",
        mostWatchedPhoto.media
            ? mostWatchedPhoto.media.name
            : "No data"
    );


    setText(
        "lifetime-most-watched-photo-time",
        mostWatchedPhoto.media
            ? formatTime(
                mostWatchedPhoto.time
            )
            : "—"
    );


    /* 11. Most watched video */

    setText(
        "lifetime-most-watched-video",
        mostWatchedVideo.media
            ? mostWatchedVideo.media.name
            : "No data"
    );


    setText(
        "lifetime-most-watched-video-time",
        mostWatchedVideo.media
            ? formatTime(
                mostWatchedVideo.time
            )
            : "—"
    );


    /* 12. Total lifetime sessions */

    setText(
        "lifetime-total-sessions",
        totalSessions
    );


    setText(
        "lifetime-sessions",
        totalSessions
    );


    /* 13. Time spent watching */

    setText(
        "lifetime-time-spend",
        formatLifetimeHours(
            totalWatchTime
        )
    );


    /* Existing HTML ID */

    setText(
        "lifetime-watch-time",
        formatLifetimeHours(
            totalWatchTime
        )
    );


    /* 14. Highest session */

    setText(
        "lifetime-highest-session",
        highestSession.key
            ? `${highestSession.value} sessions`
            : "—"
    );


    setText(
        "lifetime-highest-session-date",
        highestSession.key
            ? formatDate(
                highestSession.key
            )
            : "No data"
    );


    /* 15. Most time spent */

    setText(
        "lifetime-highest-time",
        highestWatch.key
            ? formatTime(
                highestWatch.value
            )
            : "—"
    );


    setText(
        "lifetime-highest-time-date",
        highestWatch.key
            ? formatDate(
                highestWatch.key
            )
            : "No data"
    );


    renderMostWatchedMedia(
        "lifetime-most-watched-photo-media",
        mostWatchedPhoto.media,
        mostWatchedPhoto.time
    );


    renderMostWatchedMedia(
        "lifetime-most-watched-video-media",
        mostWatchedVideo.media,
        mostWatchedVideo.time
    );
}


/* =========================================================
   LIFETIME HOURS FORMAT
========================================================= */

function formatLifetimeHours(seconds) {
    seconds =
        normalizeSeconds(
            seconds
        );

    const hours =
        Math.floor(
            seconds / 3600
        );

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
}


/* =========================================================
   DASHBOARD MEDIA PREVIEW
========================================================= */

function renderMostWatchedMedia(
    containerId,
    media,
    watchTime
) {
    const container =
        $(containerId);

    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (!media) {
        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "dashboard-empty";

        empty.textContent =
            "No data yet";

        container.appendChild(
            empty
        );

        return;
    }


    let element;


    if (
        media.type === "photo"
    ) {
        element =
            document.createElement(
                "img"
            );

        element.src =
            media.path;

        element.alt =
            media.name;

        element.className =
            "most-watched-media-image";

        element.loading =
            "lazy";

    } else {
        element =
            document.createElement(
                "video"
            );

        element.src =
            media.path;

        element.className =
            "most-watched-media-video";

        element.autoplay =
            true;

        element.loop =
            true;

        element.muted =
            true;

        element.defaultMuted =
            true;

        element.playsInline =
            true;

        element.controls =
            false;

        element.preload =
            "metadata";


        on(
            element,
            "loadeddata",
            () => {
                element.play()
                    .catch(() => {});
            }
        );
    }


    container.appendChild(
        element
    );


    const time =
        document.createElement(
            "span"
        );

    time.className =
        "most-watched-time";

    time.textContent =
        formatTime(
            watchTime
        );


    container.appendChild(
        time
    );
}


/* =========================================================
   MONTHLY / LIFETIME MEDIA FALLBACKS
========================================================= */

function findExisting(
    ids
) {
    for (
        const id of ids
    ) {
        const element =
            $(id);

        if (element) {
            return element;
        }
    }

    return null;
}


/* =========================================================
   ANALYTICS DATA REPAIR
========================================================= */

function repairAnalytics() {
    analytics =
        normalizeAnalytics(
            analytics
        );


    Object.values(
        analytics.media
    ).forEach(
        stats => {
            if (
                typeof stats.totalWatchTime !==
                "number"
            ) {
                stats.totalWatchTime =
                    0;
            }


            if (
                typeof stats.totalViews !==
                "number"
            ) {
                stats.totalViews =
                    0;
            }


            if (
                !stats.monthly ||
                typeof stats.monthly !==
                "object"
            ) {
                stats.monthly =
                    {};
            }


            if (
                !stats.monthlyViews ||
                typeof stats.monthlyViews !==
                "object"
            ) {
                stats.monthlyViews =
                    {};
            }
        }
    );


    analytics.sessions =
        analytics.sessions
            .filter(
                session =>
                    session &&
                    typeof session ===
                    "object"
            )
            .map(
                session => ({
                    id:
                        session.id ||
                        createSessionId(),

                    startTime:
                        session.startTime ||
                        null,

                    endTime:
                        session.endTime ||
                        null,

                    date:
                        session.date ||
                        null,

                    mediaOpened:
                        normalizeSeconds(
                            session.mediaOpened
                        ),

                    uniqueMedia:
                        Array.isArray(
                            session.uniqueMedia
                        )
                            ? session.uniqueMedia
                            : [],

                    watchTime:
                        normalizeSeconds(
                            session.watchTime
                        )
                })
            );
}


/* =========================================================
   DEBUG / INFORMATION
========================================================= */

function getArchiveStats() {
    return {
        photos:
            photos.length,

        videos:
            videos.length,

        songs:
            songs.length,

        media:
            mediaLibrary.length,

        sessions:
            analytics.sessions.length,

        currentScreen:
            state.currentScreen,

        currentMedia:
            getMedia(
                state.currentMediaIndex
            )?.name || null,

        selectedSong:
            state.selectedSong?.name || null
    };
}


/* =========================================================
   EXPOSE DEBUG API
========================================================= */

window.ArchiveApp = {
    state,
    analytics,

    songs,
    photos,
    videos,
    mediaLibrary,

    nextMedia,
    previousMedia,

    setZoom,
    setVolume,
    toggleMute,

    renderDashboard,

    saveAnalytics,

    getArchiveStats
};


/* =========================================================
   START APPLICATION
========================================================= */

function boot() {
    repairAnalytics();

    initializeApp();
}


if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        boot,
        {
            once: true
        }
    );
} else {
    boot();
}
