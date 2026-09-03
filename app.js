/* =========================================================
   ARCHIVE — MAIN APPLICATION
   Completely rebuilt JavaScript
   Version: 3.0
========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = Object.freeze({
    photosPath: "assets/photos/",
    videosPath: "assets/videos/",
    musicPath: "assets/music/",
    thumbnailsPath: "assets/music/thumbnails/",

    totalPhotos: 22,
    totalVideos: 19,
    totalSongs: 26,

    photoPng: new Set([
        4, 
        11,
        12,
        13,
        16,
        17,        
    ]),

    hoverDelay: 500,
    transitionDuration: 280,
    analyticsSaveInterval: 5000,
    timerInterval: 1000,

    minZoom: 1,
    maxZoom: 3,
    zoomStep: 0.1,

    defaultVolume: 0.8,

    storage: {
        analytics: "archive_analytics_v3",
        preferences: "archive_preferences_v3"
    }
});


/* =========================================================
   SONG DATA
========================================================= */

const SONG_NAMES = [
    "Nasha",
    "Into you",
    "Ajab sa",
    "Dewaaniyat",
    "Inna sona",
    "Ishq Bullava",
    "Kalyani",
    "Bol na halke halke",
    "Mera yaar",
    "Fakira",
    "Ter bin",
    "Tere jiya hor disda",
    "Teri narron ke sadke",
    "Teri bin",
    "Aarzu",
    "Teri narzon ke karan",
    "Dil diya gallan",
    "Gallan Goodiyan",
    "Maula maula re",
    "O rangrez",
    "Paniyon sa",
    "Tere mast mast do nain",
    "Sajda",
    "Ve haaniyan",
    "Heeriye",
    "New song"
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const songs = ALPHABET.map((letter, index) => {
    const number = index + 1;

    return {
        id: `${letter}${number}`,
        name: SONG_NAMES[index],
        file: `${letter}${number}.mp4`,
        path: `${CONFIG.musicPath}${letter}${number}.mp4`,
        thumbnail: `${CONFIG.thumbnailsPath}${number}.png`,
        trackNumber: number
    };
});


/* =========================================================
   PHOTO DATA
========================================================= */

const photos = Array.from(
    { length: CONFIG.totalPhotos },
    (_, index) => {
        const number = index + 1;

        const extension =
            CONFIG.photoPng.has(number)
                ? "png"
                : "jpg";

        return {
            id: `photo-${number}`,
            type: "photo",
            name: `Photo ${number}`,
            file: `${number}.${extension}`,
            path: `${CONFIG.photosPath}${number}.${extension}`,
            number
        };
    }
);


/* =========================================================
   VIDEO DATA
========================================================= */

const videos = ALPHABET
    .slice(0, CONFIG.totalVideos)
    .map(letter => ({
        id: `video-${letter}`,
        type: "video",
        name: `Video ${letter}`,
        file: `${letter}.mp4`,
        path: `${CONFIG.videosPath}${letter}.mp4`,
        letter
    }));


/* =========================================================
   COMPLETE MEDIA LIBRARY

   Order:
   Photo 1 → Photo 22
   Video A → Video S
========================================================= */

const mediaLibrary = [
    ...photos,
    ...videos
];


/* =========================================================
   DOM HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}

function qs(selector) {
    return document.querySelector(selector);
}

function qsa(selector) {
    return [...document.querySelectorAll(selector)];
}

function on(element, event, handler, options) {
    if (element) {
        element.addEventListener(
            event,
            handler,
            options
        );
    }
}

function setText(id, value) {
    const element = $(id);

    if (element) {
        element.textContent =
            value == null
                ? "—"
                : String(value);
    }
}


/* =========================================================
   DOM REFERENCES
========================================================= */

/* Loader */

const loader =
    $("app-loader");


/* Screens */

const musicScreen =
    $("music-screen");

const viewerScreen =
    $("viewer-screen");

const dashboardScreen =
    $("dashboard-screen");


/* Music */

const songContainer =
    $("song-container");

const viewToggle =
    $("view-toggle");

const viewModeText =
    $("view-mode");

const skipButton =
    $("skip-button");

const backgroundAudio =
    $("background-audio");


/* Viewer */

const mediaWrapper =
    $("media-wrapper");

const currentMediaName =
    $("current-media-name");

const previousMediaButton =
    $("previous-media");

const nextMediaButton =
    $("next-media");

const mediaWatchTime =
    $("media-watch-time");

const mediaPosition =
    $("media-position");

const zoomSlider =
    $("zoom-slider");

const zoomInButton =
    $("zoom-in");

const zoomOutButton =
    $("zoom-out");

const volumeControl =
    $("volume-control");

const volumeButton =
    $("volume-button");

const volumeSlider =
    $("volume-slider");

const muteButton =
    $("mute-button");

const fullscreenButton =
    $("fullscreen-button");

const openDashboardButton =
    $("open-dashboard");


/* Dashboard */

const backToViewerButton =
    $("back-to-viewer");

const monthSelector =
    $("month-selector");

const currentMonthLabel =
    $("current-month-label");


/* Transition */

const transitionOverlay =
    $("transition-overlay");


/* =========================================================
   DEFAULT PREFERENCES
========================================================= */

function createDefaultPreferences() {
    return {
        volume: CONFIG.defaultVolume,
        muted: false,
        viewMode: "grid"
    };
}


/* =========================================================
   PREFERENCES
========================================================= */

function loadPreferences() {
    try {
        const raw =
            localStorage.getItem(
                CONFIG.storage.preferences
            );

        if (!raw) {
            return createDefaultPreferences();
        }

        const parsed =
            JSON.parse(raw);

        return {
            ...createDefaultPreferences(),
            ...parsed
        };
    } catch (error) {
        console.warn(
            "Preferences could not be loaded.",
            error
        );

        return createDefaultPreferences();
    }
}

function savePreferences() {
    try {
        localStorage.setItem(
            CONFIG.storage.preferences,
            JSON.stringify({
                volume: state.volume,
                muted: state.muted,
                viewMode: state.viewMode
            })
        );
    } catch (error) {
        console.warn(
            "Preferences could not be saved.",
            error
        );
    }
}


/* =========================================================
   ANALYTICS DATA
========================================================= */

function createDefaultAnalytics() {
    const now =
        new Date().toISOString();

    return {
        version: 3,
        createdAt: now,
        updatedAt: now,

        sessions: [],

        media: {}
    };
}


/* =========================================================
   ANALYTICS NORMALIZATION
========================================================= */

function normalizeAnalytics(data) {
    const base =
        createDefaultAnalytics();

    if (
        !data ||
        typeof data !== "object"
    ) {
        return base;
    }

    if (!Array.isArray(data.sessions)) {
        data.sessions = [];
    }

    if (
        !data.media ||
        typeof data.media !== "object"
    ) {
        data.media = {};
    }

    data.version = 3;

    if (!data.createdAt) {
        data.createdAt =
            base.createdAt;
    }

    data.updatedAt =
        new Date().toISOString();

    return data;
}


/* =========================================================
   LOAD ANALYTICS
========================================================= */

function loadAnalytics() {
    try {
        const raw =
            localStorage.getItem(
                CONFIG.storage.analytics
            );

        if (!raw) {
            return createDefaultAnalytics();
        }

        return normalizeAnalytics(
            JSON.parse(raw)
        );
    } catch (error) {
        console.error(
            "Analytics could not be loaded.",
            error
        );

        return createDefaultAnalytics();
    }
}


let analytics =
    loadAnalytics();


/* =========================================================
   SAVE ANALYTICS
========================================================= */

function saveAnalytics() {
    try {
        analytics.updatedAt =
            new Date().toISOString();

        localStorage.setItem(
            CONFIG.storage.analytics,
            JSON.stringify(analytics)
        );
    } catch (error) {
        console.error(
            "Analytics could not be saved.",
            error
        );
    }
}


/* =========================================================
   APPLICATION STATE
========================================================= */

const preferences =
    loadPreferences();

const state = {
    currentScreen: "music",

    currentMediaIndex: 0,

    selectedSong: null,

    viewMode:
        preferences.viewMode === "list"
            ? "list"
            : "grid",

    zoom: 1,

    volume:
        clamp(
            Number(preferences.volume),
            0,
            1
        ),

    muted:
        Boolean(preferences.muted),

    currentMediaElement: null,

    currentSession: null,

    sessionStarted: false,

    mediaStartTimestamp: null,

    mediaElapsedSeconds: 0,

    timerInterval: null,

    analyticsSaveTimer: null,

    previewAudio: null,

    previewSongId: null,

    transitionLocked: false,

    pageVisible:
        !document.hidden,

    dashboardReturnScreen:
        "viewer",

    selectedDashboardMonth:
        getMonthKey()
};


/* =========================================================
   BASIC UTILITIES
========================================================= */

function clamp(value, min, max) {
    return Math.min(
        max,
        Math.max(min, value)
    );
}

function isFiniteNumber(value) {
    return (
        typeof value === "number" &&
        Number.isFinite(value)
    );
}


/* =========================================================
   DATE HELPERS
========================================================= */

function getDateObject() {
    return new Date();
}

function getTodayKey(date = getDateObject()) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getMonthKey(date = getDateObject()) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    return `${year}-${month}`;
}

function formatDate(dateKey) {
    if (!dateKey) {
        return "—";
    }

    const date =
        new Date(
            `${dateKey}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return dateKey;
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(date);
}

function formatMonth(monthKey) {
    if (!monthKey) {
        return "—";
    }

    const [year, month] =
        monthKey.split("-");

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

    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    ).format(date);
}


/* =========================================================
   TIME HELPERS
========================================================= */

function normalizeSeconds(value) {
    return Math.max(
        0,
        Math.floor(
            Number(value) || 0
        )
    );
}

function formatTime(seconds) {
    seconds =
        normalizeSeconds(seconds);

    const hours =
        Math.floor(
            seconds / 3600
        );

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    const remaining =
        seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${remaining}s`;
    }

    if (minutes > 0) {
        return `${minutes}m ${remaining}s`;
    }

    return `${remaining}s`;
}

function formatCompactTime(seconds) {
    seconds =
        normalizeSeconds(seconds);

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

    if (minutes > 0) {
        return `${minutes}m`;
    }

    return `${seconds}s`;
}

function formatClock(seconds) {
    seconds =
        normalizeSeconds(seconds);

    const hours =
        Math.floor(
            seconds / 3600
        );

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    const remaining =
        seconds % 60;

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(remaining).padStart(2, "0")
    ].join(":");
}


/* =========================================================
   MEDIA LOOKUP
========================================================= */

function getMedia(index) {
    return mediaLibrary[index] || null;
}

function getMediaById(id) {
    return (
        mediaLibrary.find(
            media => media.id === id
        ) || null
    );
}


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeApp() {
    applyPreferences();

    renderSongs();

    initializeViewMode();

    initializeMonthSelector();

    bindEvents();

    updateViewerUI();

    hideLoader();

    console.log(
        `Archive initialized: ${photos.length} photos, ${videos.length} videos, ${songs.length} songs.`
    );
}


/* =========================================================
   APPLY PREFERENCES
========================================================= */

function applyPreferences() {
    if (volumeSlider) {
        volumeSlider.value =
            String(state.volume);
    }

    applyAudioSettings();

    updateVolumeUI();
}


/* =========================================================
   AUDIO SETTINGS
========================================================= */

function applyAudioSettings() {
    if (!backgroundAudio) {
        return;
    }

    backgroundAudio.volume =
        state.volume;

    backgroundAudio.muted =
        state.muted;
}


/* =========================================================
   LOADER
========================================================= */

function hideLoader() {
    if (!loader) {
        return;
    }

    window.setTimeout(() => {
        loader.classList.add(
            "hidden"
        );
    }, 450);
}


/* =========================================================
   EVENT BINDINGS
========================================================= */

function bindEvents() {

    /* Music */

    on(
        viewToggle,
        "click",
        toggleViewMode
    );

    on(
        skipButton,
        "click",
        skipMusic
    );


    /* Viewer */

    on(
        previousMediaButton,
        "click",
        previousMedia
    );

    on(
        nextMediaButton,
        "click",
        nextMedia
    );

    on(
        zoomSlider,
        "input",
        event => {
            setZoom(
                Number(
                    event.target.value
                )
            );
        }
    );

    on(
        zoomInButton,
        "click",
        () => {
            setZoom(
                state.zoom +
                CONFIG.zoomStep
            );
        }
    );

    on(
        zoomOutButton,
        "click",
        () => {
            setZoom(
                state.zoom -
                CONFIG.zoomStep
            );
        }
    );

    on(
        volumeSlider,
        "input",
        event => {
            setVolume(
                Number(
                    event.target.value
                )
            );
        }
    );

    on(
        muteButton,
        "click",
        toggleMute
    );

    on(
        volumeButton,
        "click",
        toggleMute
    );

    on(
        fullscreenButton,
        "click",
        toggleFullscreen
    );

    on(
        openDashboardButton,
        "click",
        openDashboard
    );


    /* Dashboard */

    on(
        backToViewerButton,
        "click",
        backToViewer
    );

    on(
        monthSelector,
        "change",
        () => {
            state.selectedDashboardMonth =
                monthSelector.value;

            renderDashboard();
        }
    );


    /* Keyboard */

    on(
        document,
        "keydown",
        handleKeyboard
    );


    /* Page visibility */

    on(
        document,
        "visibilitychange",
        handleVisibilityChange
    );


    /* Window lifecycle */

    on(
        window,
        "pagehide",
        handlePageExit
    );

    on(
        window,
        "beforeunload",
        handlePageExit
    );
}


/* =========================================================
   SCREEN NAVIGATION
========================================================= */

function showScreen(screenName) {
    const screens = {
        music: musicScreen,
        viewer: viewerScreen,
        dashboard: dashboardScreen
    };

    const target =
        screens[screenName];

    if (!target) {
        return;
    }

    if (
        state.currentScreen ===
        screenName
    ) {
        return;
    }

    if (state.transitionLocked) {
        return;
    }

    state.transitionLocked =
        true;

    if (transitionOverlay) {
        transitionOverlay.classList.add(
            "show"
        );
    }

    window.setTimeout(() => {
        Object.values(screens)
            .filter(Boolean)
            .forEach(screen => {
                screen.classList.remove(
                    "active"
                );
            });

        target.classList.add(
            "active"
        );

        state.currentScreen =
            screenName;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, CONFIG.transitionDuration);

    window.setTimeout(() => {
        if (transitionOverlay) {
            transitionOverlay.classList.remove(
                "show"
            );
        }

        state.transitionLocked =
            false;
    }, CONFIG.transitionDuration + 350);
}


/* =========================================================
   MUSIC VIEW MODE
========================================================= */

function initializeViewMode() {
    if (!songContainer) {
        return;
    }

    updateViewModeClasses();
}

function updateViewModeClasses() {
    if (!songContainer) {
        return;
    }

    const grid =
        state.viewMode === "grid";

    songContainer.classList.toggle(
        "grid-view",
        grid
    );

    songContainer.classList.toggle(
        "list-view",
        !grid
    );

    if (viewModeText) {
        viewModeText.textContent =
            grid
                ? "Grid"
                : "List";
    }
}

function toggleViewMode() {
    state.viewMode =
        state.viewMode === "grid"
            ? "list"
            : "grid";

    updateViewModeClasses();

    savePreferences();
}


/* =========================================================
   SONG RENDERING
========================================================= */

function renderSongs() {
    if (!songContainer) {
        return;
    }

    songContainer.innerHTML = "";

    const fragment =
        document.createDocumentFragment();

    songs.forEach(
        (song, index) => {
            fragment.appendChild(
                createSongCard(
                    song,
                    index
                )
            );
        }
    );

    songContainer.appendChild(
        fragment
    );
}


/* =========================================================
   CREATE SONG CARD
========================================================= */

function createSongCard(song, index) {
    const card =
        document.createElement(
            "article"
        );

    card.className =
        "song-card";

    card.dataset.songId =
        song.id;

    card.tabIndex = 0;

    card.setAttribute(
        "role",
        "button"
    );

    card.setAttribute(
        "aria-label",
        `Open ${song.name}`
    );


    /* Thumbnail */

    const thumbnail =
        document.createElement(
            "div"
        );

    thumbnail.className =
        "song-thumbnail";


    /* Image */

    const image =
        document.createElement(
            "img"
        );

    image.className =
        "song-thumbnail-image";

    image.src =
        song.thumbnail;

    image.alt =
        song.name;

    image.loading =
        "lazy";

    image.decoding =
        "async";

    image.draggable =
        false;


    /* Fallback */

    const fallback =
        document.createElement(
            "div"
        );

    fallback.className =
        "song-thumbnail-fallback";

    fallback.textContent =
        String(
            song.trackNumber
        ).padStart(2, "0");


    on(
        image,
        "error",
        () => {
            image.style.display =
                "none";

            fallback.classList.add(
                "show"
            );
        }
    );


    /* Preview button */

    const previewButton =
        document.createElement(
            "button"
        );

    previewButton.type =
        "button";

    previewButton.className =
        "song-preview-button";

    previewButton.setAttribute(
        "aria-label",
        `Preview ${song.name}`
    );

    previewButton.innerHTML =
        "<span>▶</span>";


    /* Info */

    const details =
        document.createElement(
            "div"
        );

    details.className =
        "song-details";


    const subtitle =
        document.createElement(
            "div"
        );

    subtitle.className =
        "song-subtitle";

    subtitle.textContent =
        `TRACK ${String(song.trackNumber).padStart(2, "0")}`;


    const title =
        document.createElement(
            "div"
        );

    title.className =
        "song-name";

    title.textContent =
        song.name;


    const file =
        document.createElement(
            "div"
        );

    file.className =
        "song-file";

    file.textContent =
        song.file;


    details.appendChild(
        subtitle
    );

    details.appendChild(
        title
    );

    details.appendChild(
        file
    );


    thumbnail.appendChild(
        image
    );

    thumbnail.appendChild(
        fallback
    );

    thumbnail.appendChild(
        previewButton
    );


    card.appendChild(
        thumbnail
    );

    card.appendChild(
        details
    );


    initializeSongInteractions(
        card,
        song,
        previewButton
    );

    return card;
}


/* =========================================================
   SONG INTERACTIONS
========================================================= */

function initializeSongInteractions(
    card,
    song,
    previewButton
) {
    let hoverTimer = null;

    let inside = false;


    on(
        card,
        "mouseenter",
        () => {
            inside = true;

            clearTimeout(
                hoverTimer
            );

            hoverTimer =
                window.setTimeout(() => {
                    if (inside) {
                        card.classList.add(
                            "hover-ready"
                        );
                    }
                }, CONFIG.hoverDelay);
        }
    );


    on(
        card,
        "mouseleave",
        () => {
            inside = false;

            clearTimeout(
                hoverTimer
            );

            card.classList.remove(
                "hover-ready"
            );
        }
    );


    on(
        card,
        "click",
        event => {
            if (
                event.target.closest(
                    ".song-preview-button"
                )
            ) {
                return;
            }

            selectSong(song);
        }
    );


    on(
        card,
        "keydown",
        event => {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();

                selectSong(song);
            }
        }
    );


    on(
        previewButton,
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            previewSong(song);
        }
    );
}


/* =========================================================
   SONG PREVIEW
========================================================= */

function previewSong(song) {

    if (
        state.previewSongId === song.id &&
        state.previewAudio &&
        !state.previewAudio.paused
    ) {
        stopSongPreview();
        return;
    }

    stopSongPreview();


    /*
       Use HTMLMediaElement directly.

       The play() call happens inside the
       button's click event, which is important
       for browser autoplay policies.
    */

    const preview =
        document.createElement(
            "video"
        );

    preview.src =
        song.path;

    preview.preload =
        "auto";

    preview.playsInline =
        true;

    preview.controls =
        false;

    preview.muted =
        state.muted;

    preview.volume =
        state.volume;

    preview.style.display =
        "none";


    document.body.appendChild(
        preview
    );


    state.previewAudio =
        preview;

    state.previewSongId =
        song.id;


    markPreviewingSong(
        song.id
    );


    const playPromise =
        preview.play();


    if (
        playPromise &&
        typeof playPromise.then ===
        "function"
    ) {
        playPromise.catch(error => {
            console.warn(
                "Preview could not start:",
                error
            );

            stopSongPreview();
        });
    }


    on(
        preview,
        "ended",
        stopSongPreview
    );


    on(
        preview,
        "error",
        () => {
            console.warn(
                `Could not load ${song.file}`
            );

            stopSongPreview();
        }
    );
}


/* =========================================================
   MARK PREVIEWING SONG
========================================================= */

function markPreviewingSong(songId) {
    qsa(
        ".song-card"
    ).forEach(card => {
        card.classList.toggle(
            "previewing",
            card.dataset.songId ===
            songId
        );
    });
}


/* =========================================================
   STOP PREVIEW
========================================================= */

function stopSongPreview() {
    if (state.previewAudio) {
        try {
            state.previewAudio.pause();

            state.previewAudio.removeAttribute(
                "src"
            );

            state.previewAudio.load();

            state.previewAudio.remove();
        } catch (error) {
            console.warn(
                "Preview cleanup failed.",
                error
            );
        }
    }

    state.previewAudio =
        null;

    state.previewSongId =
        null;

    qsa(
        ".song-card.previewing"
    ).forEach(card => {
        card.classList.remove(
            "previewing"
        );
    });
}


/* =========================================================
   SELECT SONG
========================================================= */

function selectSong(song) {
    stopSongPreview();

    state.selectedSong =
        song;

    startBackgroundMusic(
        song
    );

    enterViewer();
}


/* =========================================================
   BACKGROUND MUSIC
========================================================= */

function startBackgroundMusic(song) {
    if (!backgroundAudio || !song) {
        return;
    }

    try {
        backgroundAudio.pause();

        backgroundAudio.currentTime =
            0;

        backgroundAudio.src =
            song.path;

        backgroundAudio.loop =
            true;

        backgroundAudio.preload =
            "auto";

        backgroundAudio.volume =
            state.volume;

        backgroundAudio.muted =
            state.muted;

        /*
           Called immediately from the song click
           chain so browsers treat it as user initiated.
        */

        const promise =
            backgroundAudio.play();

        if (
            promise &&
            typeof promise.catch ===
            "function"
        ) {
            promise.catch(error => {
                console.warn(
                    "Background music could not start:",
                    error
                );
            });
        }
    } catch (error) {
        console.error(
            "Background music error:",
            error
        );
    }
}


/* =========================================================
   STOP BACKGROUND MUSIC
========================================================= */

function stopBackgroundMusic() {
    if (!backgroundAudio) {
        return;
    }

    try {
        backgroundAudio.pause();

        backgroundAudio.currentTime =
            0;

        backgroundAudio.removeAttribute(
            "src"
        );

        backgroundAudio.load();
    } catch (error) {
        console.warn(
            "Background audio cleanup failed.",
            error
        );
    }
}


/* =========================================================
   SKIP MUSIC
========================================================= */

function skipMusic() {
    stopSongPreview();

    stopBackgroundMusic();

    state.selectedSong =
        null;

    enterViewer();
}


/* =========================================================
   SESSION ID
========================================================= */

function createSessionId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
        "function"
    ) {
        return window.crypto.randomUUID();
    }

    return [
        "session",
        Date.now(),
        Math.random()
            .toString(16)
            .slice(2)
    ].join("-");
}


/* =========================================================
   START SESSION
========================================================= */

function startSession() {

    if (state.sessionStarted) {
        return;
    }

    const now =
        new Date();

    state.currentSession = {
        id: createSessionId(),

        startTime:
            now.toISOString(),

        endTime: null,

        date:
            getTodayKey(now),

        mediaOpened: 0,

        uniqueMedia: [],

        watchTime: 0
    };

    state.sessionStarted =
        true;

    state.mediaStartTimestamp =
        null;

    state.mediaElapsedSeconds =
        0;

    analytics.sessions.push(
        state.currentSession
    );

    saveAnalytics();
}


/* =========================================================
   END SESSION
========================================================= */

function endSession() {
    if (
        !state.currentSession
    ) {
        return;
    }

    commitCurrentMediaTime();

    state.currentSession.endTime =
        new Date().toISOString();

    saveAnalytics();

    state.currentSession =
        null;

    state.sessionStarted =
        false;

    state.mediaStartTimestamp =
        null;

    state.mediaElapsedSeconds =
        0;

    stopMediaTimer();
}


/* =========================================================
   ENTER VIEWER
========================================================= */

function enterViewer() {

    if (!state.sessionStarted) {
        startSession();
    }

    state.currentMediaIndex =
        0;

    state.dashboardReturnScreen =
        "viewer";

    showScreen(
        "viewer"
    );

    window.setTimeout(() => {
        loadMedia(
            state.currentMediaIndex
        );
    }, CONFIG.transitionDuration + 40);
}


/* =========================================================
   LOAD MEDIA
========================================================= */

function loadMedia(index) {
    const media =
        getMedia(index);

    if (!media || !mediaWrapper) {
        return;
    }


    /* Save previous media time first */

    if (
        state.currentMediaElement
    ) {
        commitCurrentMediaTime();

        cleanupCurrentMediaElement();
    }


    state.currentMediaIndex =
        index;

    state.zoom =
        CONFIG.minZoom;

    state.mediaElapsedSeconds =
        0;

    state.mediaStartTimestamp =
        Date.now();


    mediaWrapper.innerHTML =
        "";


    /* Create new element */

    let element;


    if (media.type === "photo") {

        element =
            document.createElement(
                "img"
            );

        element.className =
            "viewer-image viewer-photo";

        element.src =
            media.path;

        element.alt =
            media.name;

        element.draggable =
            false;

        element.decoding =
            "async";

        element.loading =
            "eager";

    } else {

        element =
            document.createElement(
                "video"
            );

        element.className =
            "viewer-video";

        element.src =
            media.path;

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
            "auto";

        /*
           Viewer videos intentionally have
           NO controls and are automatically played.
        */

        on(
            element,
            "loadeddata",
            () => {
                element.play()
                    .catch(() => {});
            }
        );
    }


    mediaWrapper.appendChild(
        element
    );


    state.currentMediaElement =
        element;


    registerMediaOpen(
        media
    );


    applyZoom();

    updateViewerUI();

    startMediaTimer();


    /*
       Photos/videos can fail because of a bad
       filename or missing asset. Keep viewer alive.
    */

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