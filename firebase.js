/* =========================================================
   ARCHIVE — FIREBASE
   Shared analytics sync for Archive
   ========================================================= */

"use strict";

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    runTransaction,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyBfFPH9g4SPwxyvt81MmZNw-2WTQ72pZ0k",
    authDomain: "archive-2912.firebaseapp.com",
    projectId: "archive-2912",
    storageBucket: "archive-2912.firebasestorage.app",
    messagingSenderId: "437886370669",
    appId: "1:437886370669:web:aa2429225420a0abf51064"
};


/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

let firebaseApp = null;
let db = null;
let firebaseReady = false;

try {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    firebaseReady = true;

    console.log("[Archive Firebase] Ready.");
} catch (error) {
    firebaseReady = false;

    console.error(
        "[Archive Firebase] Initialization failed:",
        error
    );
}


/* =========================================================
   FIRESTORE REFERENCE
   ========================================================= */

const ANALYTICS_REF = () => {
    if (!db) {
        return null;
    }

    return doc(
        db,
        "archiveUsers",
        "main"
    );
};


/* =========================================================
   LOCAL DEVICE ID
   ========================================================= */

const DEVICE_STORAGE_KEY =
    "archive_firebase_device_id_v1";

function createDeviceId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return [
        "device",
        Date.now(),
        Math.random()
            .toString(16)
            .slice(2)
    ].join("-");
}

function getDeviceId() {
    try {
        let deviceId =
            localStorage.getItem(
                DEVICE_STORAGE_KEY
            );

        if (!deviceId) {
            deviceId = createDeviceId();

            localStorage.setItem(
                DEVICE_STORAGE_KEY,
                deviceId
            );
        }

        return deviceId;
    } catch (error) {
        console.warn(
            "[Archive Firebase] Device ID unavailable.",
            error
        );

        return "fallback-device";
    }
}

const DEVICE_ID =
    getDeviceId();


/* =========================================================
   HELPERS
   ========================================================= */

function number(value) {
    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : 0;
}

function clean(value) {
    if (value === undefined) {
        return null;
    }

    if (value === null) {
        return null;
    }

    if (Array.isArray(value)) {
        return value.map(clean);
    }

    if (
        typeof value === "object" &&
        !(value instanceof Date)
    ) {
        const result = {};

        Object.keys(value).forEach(key => {
            result[key] =
                clean(value[key]);
        });

        return result;
    }

    return value;
}


/* =========================================================
   ANALYTICS NORMALIZATION
   ========================================================= */

function normalizeAnalytics(data) {
    const source =
        data &&
        typeof data === "object"
            ? data
            : {};

    return {
        version:
            number(source.version) || 3,

        createdAt:
            source.createdAt || null,

        updatedAt:
            source.updatedAt || null,

        sessions:
            Array.isArray(source.sessions)
                ? source.sessions
                : [],

        media:
            source.media &&
            typeof source.media === "object"
                ? source.media
                : {}
    };
}


/* =========================================================
   SESSION HELPERS
   ========================================================= */

function getSessionId(session) {
    if (!session) {
        return null;
    }

    if (session.id) {
        return String(session.id);
    }

    return null;
}

function getSessionTime(session) {
    if (!session) {
        return 0;
    }

    const candidates = [
        session.startTime,
        session.startedAt,
        session.timestamp,
        session.date
    ];

    for (const value of candidates) {
        if (!value) {
            continue;
        }

        const time =
            new Date(value).getTime();

        if (Number.isFinite(time)) {
            return time;
        }

        const numeric =
            Number(value);

        if (Number.isFinite(numeric)) {
            return numeric;
        }
    }

    return 0;
}


/* =========================================================
   DEVICE OWNED SESSION IDS
   ========================================================= */

const OWNED_SESSIONS_KEY =
    "archive_firebase_owned_sessions_v1";

function loadOwnedSessionIds() {
    try {
        const raw =
            localStorage.getItem(
                OWNED_SESSIONS_KEY
            );

        if (!raw) {
            return [];
        }

        const parsed =
            JSON.parse(raw);

        return Array.isArray(parsed)
            ? parsed.map(String)
            : [];
    } catch (error) {
        console.warn(
            "[Archive Firebase] Owned session IDs could not be loaded.",
            error
        );

        return [];
    }
}

function saveOwnedSessionIds(ids) {
    try {
        localStorage.setItem(
            OWNED_SESSIONS_KEY,
            JSON.stringify(
                [...new Set(ids.map(String))]
            )
        );
    } catch (error) {
        console.warn(
            "[Archive Firebase] Owned session IDs could not be saved.",
            error
        );
    }
}


/* =========================================================
   SESSION MERGING
   ========================================================= */

function mergeSessions(
    remoteSessions,
    localSessions
) {
    const map =
        new Map();

    for (
        const session
        of remoteSessions || []
    ) {
        if (!session) {
            continue;
        }

        const id =
            getSessionId(session);

        if (!id) {
            continue;
        }

        map.set(
            id,
            session
        );
    }

    for (
        const session
        of localSessions || []
    ) {
        if (!session) {
            continue;
        }

        const id =
            getSessionId(session);

        if (!id) {
            continue;
        }

        map.set(
            id,
            session
        );
    }

    return Array.from(
        map.values()
    ).sort(
        (a, b) =>
            getSessionTime(a) -
            getSessionTime(b)
    );
}


/* =========================================================
   MEDIA STAT HELPERS
   ========================================================= */

function createEmptyMediaStats() {
    return {
        totalWatchTime: 0,
        totalViews: 0,
        monthly: {},
        monthlyViews: {}
    };
}

function normalizeMediaStats(item) {
    const source =
        item &&
        typeof item === "object"
            ? item
            : {};

    const result =
        createEmptyMediaStats();

    result.totalWatchTime =
        number(
            source.totalWatchTime
        );

    result.totalViews =
        number(
            source.totalViews
        );

    if (
        source.monthly &&
        typeof source.monthly === "object"
    ) {
        Object.keys(
            source.monthly
        ).forEach(month => {
            result.monthly[month] =
                number(
                    source.monthly[month]
                );
        });
    }

    if (
        source.monthlyViews &&
        typeof source.monthlyViews === "object"
    ) {
        Object.keys(
            source.monthlyViews
        ).forEach(month => {
            result.monthlyViews[month] =
                number(
                    source.monthlyViews[month]
                );
        });
    }

    return result;
}

function cloneMedia(media) {
    const result = {};

    Object.keys(
        media || {}
    ).forEach(mediaId => {
        result[mediaId] =
            normalizeMediaStats(
                media[mediaId]
            );
    });

    return result;
}


/* =========================================================
   MEDIA BASELINE
   ========================================================= */

/*
   Older Archive versions already stored aggregated
   media statistics.

   We preserve those statistics as a one-time baseline.

   New sessions are then added on top of that baseline.

   This prevents repeated syncs from adding the same
   sessions over and over again.
*/

function mergeBaselineMedia(
    firstMedia,
    secondMedia
) {
    const result =
        cloneMedia(
            firstMedia
        );

    Object.keys(
        secondMedia || {}
    ).forEach(mediaId => {
        const incoming =
            normalizeMediaStats(
                secondMedia[mediaId]
            );

        if (!result[mediaId]) {
            result[mediaId] =
                createEmptyMediaStats();
        }

        /*
           For migration/baseline data we use the larger
           value rather than adding both copies.

           This prevents an old local copy and old Firebase
           copy from immediately doubling analytics.
        */

        result[mediaId].totalViews =
            Math.max(
                result[mediaId].totalViews,
                incoming.totalViews
            );

        result[mediaId].totalWatchTime =
            Math.max(
                result[mediaId].totalWatchTime,
                incoming.totalWatchTime
            );

        const months = new Set([
            ...Object.keys(
                result[mediaId].monthly
            ),
            ...Object.keys(
                incoming.monthly
            )
        ]);

        months.forEach(month => {
            result[mediaId].monthly[month] =
                Math.max(
                    number(
                        result[mediaId]
                            .monthly[month]
                    ),
                    number(
                        incoming
                            .monthly[month]
                    )
                );
        });

        const viewMonths = new Set([
            ...Object.keys(
                result[mediaId]
                    .monthlyViews
            ),
            ...Object.keys(
                incoming
                    .monthlyViews
            )
        ]);

        viewMonths.forEach(month => {
            result[mediaId]
                .monthlyViews[month] =
                Math.max(
                    number(
                        result[mediaId]
                            .monthlyViews[month]
                    ),
                    number(
                        incoming
                            .monthlyViews[month]
                    )
                );
        });
    });

    return result;
}


/* =========================================================
   EXTRACT MEDIA CHANGES FROM CURRENT APP SESSION
   ========================================================= */

function getSessionMediaWatchTime(
    session
) {
    if (!session) {
        return {};
    }

    /*
       Future-compatible structure.
    */

    if (
        session.mediaWatchTime &&
        typeof session.mediaWatchTime === "object"
    ) {
        return session.mediaWatchTime;
    }

    if (
        session.media &&
        typeof session.media === "object"
    ) {
        const result = {};

        Object.keys(
            session.media
        ).forEach(mediaId => {
            const item =
                session.media[mediaId];

            if (
                typeof item === "number"
            ) {
                result[mediaId] =
                    number(item);
            } else if (
                item &&
                typeof item === "object"
            ) {
                result[mediaId] =
                    number(
                        item.time ||
                        item.watchTime ||
                        item.seconds
                    );
            }
        });

        return result;
    }

    return {};
}

function getSessionMediaViews(
    session
) {
    if (!session) {
        return {};
    }

    if (
        session.mediaViews &&
        typeof session.mediaViews === "object"
    ) {
        return session.mediaViews;
    }

    /*
       Current Archive app stores the number of media
       openings at session level, but does not yet store
       which individual media was opened.

       Therefore we do NOT guess here.

       This prevents Firebase from assigning a session's
       total opens to random media.
    */

    return {};
}


/* =========================================================
   REBUILD MEDIA ANALYTICS
   ========================================================= */

function rebuildMediaStats(
    baselineMedia,
    sessions
) {
    const media =
        cloneMedia(
            baselineMedia
        );

    for (
        const session
        of sessions || []
    ) {
        if (!session) {
            continue;
        }

        const monthKey =
            session.date
                ? String(
                    session.date
                ).slice(0, 7)
                : null;

        /*
           -------------------------------------------------
           WATCH TIME
           -------------------------------------------------
        */

        const watchTime =
            getSessionMediaWatchTime(
                session
            );

        Object.keys(
            watchTime
        ).forEach(mediaId => {
            const seconds =
                number(
                    watchTime[mediaId]
                );

            if (seconds <= 0) {
                return;
            }

            if (!media[mediaId]) {
                media[mediaId] =
                    createEmptyMediaStats();
            }

            media[mediaId]
                .totalWatchTime +=
                seconds;

            if (monthKey) {
                media[mediaId]
                    .monthly[monthKey] =
                    number(
                        media[mediaId]
                            .monthly[monthKey]
                    ) + seconds;
            }
        });


        /*
           -------------------------------------------------
           MEDIA VIEWS
           -------------------------------------------------
        */

        const mediaViews =
            getSessionMediaViews(
                session
            );

        Object.keys(
            mediaViews
        ).forEach(mediaId => {
            const views =
                number(
                    mediaViews[mediaId]
                );

            if (views <= 0) {
                return;
            }

            if (!media[mediaId]) {
                media[mediaId] =
                    createEmptyMediaStats();
            }

            media[mediaId]
                .totalViews +=
                views;

            if (monthKey) {
                media[mediaId]
                    .monthlyViews[monthKey] =
                    number(
                        media[mediaId]
                            .monthlyViews[monthKey]
                    ) + views;
            }
        });
    }

    return media;
}


/* =========================================================
   LOAD FIREBASE ANALYTICS
   ========================================================= */

async function loadFirebaseAnalytics() {
    if (
        !firebaseReady ||
        !db
    ) {
        return null;
    }

    try {
        const reference =
            ANALYTICS_REF();

        if (!reference) {
            return null;
        }

        const snapshot =
            await getDoc(
                reference
            );

        if (!snapshot.exists()) {
            return null;
        }

        return normalizeAnalytics(
            snapshot.data()
        );
    } catch (error) {
        console.error(
            "[Archive Firebase] Load failed:",
            error
        );

        return null;
    }
}


/* =========================================================
   DIRECT SAVE
   ========================================================= */

async function saveFirebaseAnalytics(
    analytics
) {
    if (
        !firebaseReady ||
        !db ||
        !analytics
    ) {
        return false;
    }

    try {
        const reference =
            ANALYTICS_REF();

        if (!reference) {
            return false;
        }

        const data =
            clean(
                normalizeAnalytics(
                    analytics
                )
            );

        data.updatedAt =
            serverTimestamp();

        await setDoc(
            reference,
            data,
            {
                merge: true
            }
        );

        return true;
    } catch (error) {
        console.error(
            "[Archive Firebase] Save failed:",
            error
        );

        return false;
    }
}


/* =========================================================
   MAIN SYNC
   ========================================================= */

async function syncAnalytics(
    localAnalytics
) {
    const local =
        normalizeAnalytics(
            localAnalytics
        );

    if (
        !firebaseReady ||
        !db
    ) {
        return {
            success: false,
            source: "local",
            analytics: local
        };
    }

    try {
        const reference =
            ANALYTICS_REF();

        if (!reference) {
            return {
                success: false,
                source: "local",
                analytics: local
            };
        }

        const result =
            await runTransaction(
                db,
                async transaction => {

                    /*
                       IMPORTANT:
                       Only read Firestore inside the transaction.
                    */

                    const snapshot =
                        await transaction.get(
                            reference
                        );

                    const remote =
                        snapshot.exists()
                            ? snapshot.data()
                            : {};

                    const remoteAnalytics =
                        normalizeAnalytics(
                            remote
                        );


                    /*
                       -------------------------------------------------
                       OWNED SESSION IDS
                       -------------------------------------------------
                    */

                    let ownedSessionIds =
                        loadOwnedSessionIds();


                    /*
                       First Firebase sync:
                       Existing local sessions belong to this device.
                    */

                    if (
                        ownedSessionIds.length === 0 &&
                        local.sessions.length > 0
                    ) {
                        ownedSessionIds =
                            local.sessions
                                .map(
                                    getSessionId
                                )
                                .filter(Boolean);

                        saveOwnedSessionIds(
                            ownedSessionIds
                        );
                    }


                    /*
                       -------------------------------------------------
                       CURRENT DEVICE SESSIONS
                       -------------------------------------------------
                    */

                    const ownedSet =
                        new Set(
                            ownedSessionIds
                        );

                    const localOwnedSessions =
                        local.sessions.filter(
                            session => {
                                const id =
                                    getSessionId(
                                        session
                                    );

                                return (
                                    id &&
                                    ownedSet.has(
                                        id
                                    )
                                );
                            }
                        );


                    /*
                       -------------------------------------------------
                       REMOTE SESSIONS
                       -------------------------------------------------
                    */

                    const remoteSessions =
                        Array.isArray(
                            remoteAnalytics.sessions
                        )
                            ? remoteAnalytics.sessions
                            : [];


                    /*
                       Remote sessions which belong to other devices
                       are retained.

                       Sessions from this device are replaced by the
                       latest local copy.
                    */

                    const otherDeviceSessions =
                        remoteSessions.filter(
                            session => {
                                const id =
                                    getSessionId(
                                        session
                                    );

                                return (
                                    !id ||
                                    !ownedSet.has(
                                        id
                                    )
                                );
                            }
                        );


                    const mergedSessions =
                        mergeSessions(
                            otherDeviceSessions,
                            localOwnedSessions
                        );


                    /*
                       -------------------------------------------------
                       BASELINE MEDIA
                       -------------------------------------------------
                    */

                    let baselineMedia = {};


                    /*
                       New migration:
                       Preserve existing Firebase media statistics.
                    */

                    if (
                        remote &&
                        remote.mediaBaseline &&
                        typeof remote.mediaBaseline === "object"
                    ) {
                        baselineMedia =
                            cloneMedia(
                                remote.mediaBaseline
                            );
                    } else {
                        baselineMedia =
                            mergeBaselineMedia(
                                remoteAnalytics.media,
                                local.media
                            );
                    }


                    /*
                       -------------------------------------------------
                       REBUILD MEDIA
                       -------------------------------------------------
                    */

                    const rebuiltMedia =
                        rebuildMediaStats(
                            baselineMedia,
                            mergedSessions
                        );


                    /*
                       -------------------------------------------------
                       FINAL ANALYTICS
                       -------------------------------------------------
                    */

                    const createdAt =
                        remoteAnalytics.createdAt ||
                        local.createdAt ||
                        new Date().toISOString();


                    const finalAnalytics = {
                        version: 3,

                        createdAt,

                        updatedAt:
                            new Date().toISOString(),

                        sessions:
                            mergedSessions,

                        media:
                            rebuiltMedia
                    };


                    /*
                       -------------------------------------------------
                       SAVE
                       -------------------------------------------------
                    */

                    const firestoreData = {
                        version: 3,

                        createdAt,

                        updatedAt:
                            serverTimestamp(),

                        sessions:
                            clean(
                                mergedSessions
                            ),

                        media:
                            clean(
                                rebuiltMedia
                            ),

                        /*
                           Keep migration baseline separately.

                           This is the key protection against
                           double-counting repeated syncs.
                        */

                        mediaBaseline:
                            clean(
                                baselineMedia
                            ),

                        /*
                           Helpful metadata.
                        */

                        lastSyncDevice:
                            DEVICE_ID
                    };


                    transaction.set(
                        reference,
                        firestoreData,
                        {
                            merge: true
                        }
                    );


                    return finalAnalytics;
                }
            );


        console.log(
            "[Archive Firebase] Analytics synced."
        );


        /*
           Keep all session IDs currently visible locally
           as sessions belonging to this device.

           This is especially important after the first sync,
           because app.js receives the combined Firebase analytics.
        */

        const allLocalIds =
            local.sessions
                .map(
                    getSessionId
                )
                .filter(Boolean);

        const knownOwnedIds =
            loadOwnedSessionIds();

        saveOwnedSessionIds([
            ...knownOwnedIds,
            ...allLocalIds
        ]);


        return {
            success: true,
            source: "firebase",
            analytics: result
        };

    } catch (error) {

        console.error(
            "[Archive Firebase] Sync failed:",
            error
        );

        return {
            success: false,
            source: "local",
            analytics: local
        };
    }
}


/* =========================================================
   SAVE SESSION
   ========================================================= */

async function saveFirebaseSession(
    session,
    currentAnalytics
) {
    if (!session) {
        return false;
    }

    const analytics =
        normalizeAnalytics(
            currentAnalytics
        );


    /*
       Remember this session as belonging to this device.
    */

    const sessionId =
        getSessionId(
            session
        );

    if (sessionId) {
        const ids =
            loadOwnedSessionIds();

        if (!ids.includes(sessionId)) {
            ids.push(sessionId);
            saveOwnedSessionIds(ids);
        }
    }


    /*
       Add/update local session.
    */

    const existingIndex =
        analytics.sessions.findIndex(
            item =>
                item &&
                getSessionId(item) ===
                sessionId
        );

    if (existingIndex >= 0) {
        analytics.sessions[
            existingIndex
        ] = session;
    } else {
        analytics.sessions.push(
            session
        );
    }


    const result =
        await syncAnalytics(
            analytics
        );

    return Boolean(
        result.success
    );
}


/* =========================================================
   PUBLIC API
   ========================================================= */

window.ArchiveFirebase = {

    isReady: () =>
        firebaseReady,

    getApp: () =>
        firebaseApp,

    getDB: () =>
        db,

    loadAnalytics:
        loadFirebaseAnalytics,

    saveAnalytics:
        saveFirebaseAnalytics,

    syncAnalytics,

    saveSession:
        saveFirebaseSession
};


/* =========================================================
   EXPORTS
   ========================================================= */

export {
    firebaseApp,
    db,
    firebaseReady,
    loadFirebaseAnalytics,
    saveFirebaseAnalytics,
    syncAnalytics,
    saveFirebaseSession
};