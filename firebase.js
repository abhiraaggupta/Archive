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
   INITIALIZE
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
   FIRESTORE LOCATION
   ========================================================= */

const ANALYTICS_REF = () => {
    if (!db) return null;

    return doc(
        db,
        "archiveUsers",
        "main"
    );
};


/* =========================================================
   HELPERS
   ========================================================= */

function number(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}


function clean(value) {
    if (value === undefined) return null;
    if (value === null) return null;

    if (Array.isArray(value)) {
        return value.map(clean);
    }

    if (
        typeof value === "object" &&
        !(value instanceof Date)
    ) {
        const result = {};

        Object.keys(value).forEach(key => {
            result[key] = clean(value[key]);
        });

        return result;
    }

    return value;
}


function normalizeAnalytics(data) {
    const source = data || {};

    return {
        version: number(source.version) || 1,

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
   MERGE SESSIONS
   ========================================================= */

function mergeSessions(remoteSessions, localSessions) {
    const map = new Map();

    for (const session of remoteSessions || []) {
        if (!session) continue;

        if (session.id) {
            map.set(
                String(session.id),
                session
            );
        }
    }

    for (const session of localSessions || []) {
        if (!session) continue;

        if (session.id) {
            map.set(
                String(session.id),
                session
            );
        }
    }

    return Array.from(map.values()).sort(
        (a, b) => {
            const at =
                number(a.startedAt || a.timestamp);

            const bt =
                number(b.startedAt || b.timestamp);

            return at - bt;
        }
    );
}


/* =========================================================
   REBUILD MEDIA STATS
   ========================================================= */

function rebuildMediaStats(
    sessions,
    oldRemoteMedia = {}
) {
    const media = {};

    /*
     * First preserve old media data.
     * This is important for analytics created by
     * the previous version of Archive.
     */

    Object.keys(oldRemoteMedia || {}).forEach(
        mediaId => {
            const item =
                oldRemoteMedia[mediaId];

            if (!item) return;

            media[mediaId] = {
                ...item,
                views:
                    number(item.views),
                time:
                    number(item.time)
            };
        }
    );


    /*
     * Rebuild statistics from sessions.
     */

    for (const session of sessions || []) {
        if (!session) continue;

        const sessionMedia =
            session.media ||
            session.mediaWatchTime ||
            {};

        const opened =
            Array.isArray(session.mediaOpened)
                ? session.mediaOpened
                : [];


        /*
         * Watch time
         */

        Object.keys(sessionMedia).forEach(
            mediaId => {
                const value =
                    sessionMedia[mediaId];

                let watchTime = 0;

                if (
                    typeof value === "number"
                ) {
                    watchTime = value;
                } else if (
                    value &&
                    typeof value === "object"
                ) {
                    watchTime =
                        number(
                            value.time ||
                            value.watchTime ||
                            value.seconds
                        );
                }

                if (!media[mediaId]) {
                    media[mediaId] = {
                        views: 0,
                        time: 0
                    };
                }

                media[mediaId].time +=
                    watchTime;
            }
        );


        /*
         * Views / opens
         */

        opened.forEach(mediaId => {
            const id = String(mediaId);

            if (!media[id]) {
                media[id] = {
                    views: 0,
                    time: 0
                };
            }

            media[id].views += 1;
        });


        /*
         * Some older session formats store
         * media inside an object.
         */

        if (
            session.mediaStats &&
            typeof session.mediaStats === "object"
        ) {
            Object.keys(
                session.mediaStats
            ).forEach(mediaId => {
                const item =
                    session.mediaStats[mediaId];

                if (!media[mediaId]) {
                    media[mediaId] = {
                        views: 0,
                        time: 0
                    };
                }

                media[mediaId].views +=
                    number(item?.views);

                media[mediaId].time +=
                    number(item?.time);
            });
        }
    }


    return media;
}


/* =========================================================
   LOAD
   ========================================================= */

async function loadFirebaseAnalytics() {
    if (!firebaseReady || !db) {
        return null;
    }

    try {
        const reference =
            ANALYTICS_REF();

        if (!reference) {
            return null;
        }

        const snapshot =
            await getDoc(reference);

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
   SAVE
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
            { merge: true }
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
   SYNC
   ========================================================= */

/*
 * This is the main function used by app.js.
 *
 * Important:
 *
 * We use a Firestore transaction.
 *
 * Device A + Device B can update at almost
 * the same time. Firestore retries the transaction
 * if the document changed while we were writing.
 *
 * Sessions are merged by session.id.
 *
 * Therefore:
 *
 * Device A session
 * +
 * Device B session
 *
 * = both remain in Firebase.
 */

async function syncAnalytics(
    localAnalytics
) {
    const local =
        normalizeAnalytics(
            localAnalytics
        );

    if (!firebaseReady || !db) {
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


        const merged =
            await runTransaction(
                db,
                async transaction => {

                    const snapshot =
                        await transaction.get(
                            reference
                        );

                    const remote =
                        snapshot.exists()
                            ? normalizeAnalytics(
                                snapshot.data()
                            )
                            : {
                                version: 1,
                                createdAt: null,
                                updatedAt: null,
                                sessions: [],
                                media: {}
                            };


                    /*
                     * Merge sessions.
                     */

                    const sessions =
                        mergeSessions(
                            remote.sessions,
                            local.sessions
                        );


                    /*
                     * Rebuild media statistics.
                     */

                    const media =
                        rebuildMediaStats(
                            sessions,
                            remote.media
                        );


                    const result = {
                        version: 1,

                        createdAt:
                            remote.createdAt ||
                            local.createdAt ||
                            Date.now(),

                        updatedAt:
                            Date.now(),

                        sessions,

                        media
                    };


                    transaction.set(
                        reference,
                        {
                            ...clean(result),
                            updatedAt:
                                serverTimestamp()
                        },
                        {
                            merge: true
                        }
                    );


                    return result;
                }
            );


        console.log(
            "[Archive Firebase] Analytics synced."
        );


        return {
            success: true,
            source: "firebase",
            analytics: merged
        };

    } catch (error) {
        console.error(
            "[Archive Firebase] Sync failed:",
            error
        );

        /*
         * Firebase failure should NEVER
         * break the Archive viewer.
         */

        return {
            success: false,
            source: "local",
            analytics: local
        };
    }
}


/* =========================================================
   SAVE SINGLE SESSION
   ========================================================= */

async function saveFirebaseSession(
    session,
    currentAnalytics
) {
    if (!session) {
        return false;
    }


    /*
     * Prefer the normal sync path.
     *
     * This keeps the same session ID and
     * prevents duplicate sessions.
     */

    const analytics =
        normalizeAnalytics(
            currentAnalytics
        );


    if (
        !analytics.sessions.some(
            item =>
                item &&
                item.id === session.id
        )
    ) {
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

    isReady:
        () => firebaseReady,

    getApp:
        () => firebaseApp,

    getDB:
        () => db,

    loadAnalytics:
        loadFirebaseAnalytics,

    saveAnalytics:
        saveFirebaseAnalytics,

    syncAnalytics:
        syncAnalytics,

    saveSession:
        saveFirebaseSession
};


/* =========================================================
   NAMED EXPORTS
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