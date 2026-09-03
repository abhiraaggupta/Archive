/* =========================================================
   ARCHIVE — FIREBASE
   Firebase initialization + Firestore analytics sync
   ========================================================= */

"use strict";

/*
|--------------------------------------------------------------------------
| FIREBASE SDK
|--------------------------------------------------------------------------
| Using Firebase's official modular browser SDK.
*/

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

/*
 * Firebase Console:
 *
 * Project settings
 *      ↓
 * Your apps
 *      ↓
 * Web app
 *      ↓
 * Firebase SDK snippet
 *      ↓
 * Config
 *
 * Yahan apni ORIGINAL Firebase config paste karo.
 */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain:
        "YOUR_PROJECT.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId:
        "YOUR_MESSAGING_SENDER_ID",

    appId:
        "YOUR_APP_ID"

};


/* =========================================================
   FIREBASE INITIALIZATION
   ========================================================= */

let firebaseApp = null;

let db = null;

let firebaseReady = false;


/*
|--------------------------------------------------------------------------
| Initialize Firebase
|--------------------------------------------------------------------------
*/

try {

    /*
     * Don't initialize Firebase if the config hasn't
     * been filled in yet.
     */

    const configIsValid =
        firebaseConfig.apiKey &&
        firebaseConfig.apiKey !== "YOUR_API_KEY" &&
        firebaseConfig.projectId &&
        firebaseConfig.projectId !== "YOUR_PROJECT_ID";


    if (configIsValid) {

        firebaseApp =
            initializeApp(
                firebaseConfig
            );


        db =
            getFirestore(
                firebaseApp
            );


        firebaseReady = true;


        console.log(
            "[Firebase] Connected successfully."
        );

    } else {

        console.warn(
            "[Firebase] Configuration is missing. " +
            "Running with localStorage only."
        );

    }

} catch (error) {

    firebaseReady = false;

    console.error(
        "[Firebase] Initialization failed:",
        error
    );

}


/* =========================================================
   CONSTANTS
   ========================================================= */

const FIREBASE_COLLECTION =
    "archiveUsers";

const FIREBASE_DOCUMENT =
    "main";


/* =========================================================
   INTERNAL HELPERS
   ========================================================= */

/*
|--------------------------------------------------------------------------
| Get Firestore document reference
|--------------------------------------------------------------------------
*/

function getAnalyticsRef() {

    if (!db) {
        return null;
    }

    return doc(
        db,
        FIREBASE_COLLECTION,
        FIREBASE_DOCUMENT
    );

}


/*
|--------------------------------------------------------------------------
| Safe clone
|--------------------------------------------------------------------------
|
| Firestore doesn't need undefined values.
| This also prevents accidental mutation of local objects.
*/

function cleanObject(value) {

    if (value === undefined) {
        return null;
    }


    if (value === null) {
        return null;
    }


    if (Array.isArray(value)) {

        return value.map(
            item => cleanObject(item)
        );

    }


    if (
        typeof value === "object" &&
        !(value instanceof Date)
    ) {

        const output = {};

        Object.keys(value).forEach(
            key => {

                const cleaned =
                    cleanObject(
                        value[key]
                    );


                if (
                    cleaned !== undefined
                ) {

                    output[key] =
                        cleaned;

                }

            }
        );

        return output;

    }


    return value;

}


/*
|--------------------------------------------------------------------------
| Normalize analytics structure
|--------------------------------------------------------------------------
*/

function normalizeAnalytics(data) {

    const source =
        data || {};


    return {

        version:
            Number(
                source.version || 1
            ),


        createdAt:
            source.createdAt || null,


        updatedAt:
            source.updatedAt || null,


        sessions:
            Array.isArray(
                source.sessions
            )
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
   LOAD ANALYTICS
   ========================================================= */

/*
|--------------------------------------------------------------------------
| loadFirebaseAnalytics
|--------------------------------------------------------------------------
|
| Returns:
|
|     analytics object
|
| or
|
|     null
|
| when Firebase isn't configured / unavailable.
|--------------------------------------------------------------------------
*/

async function loadFirebaseAnalytics() {

    if (!firebaseReady || !db) {

        return null;

    }


    try {

        const reference =
            getAnalyticsRef();


        if (!reference) {

            return null;

        }


        const snapshot =
            await getDoc(
                reference
            );


        if (!snapshot.exists()) {

            console.log(
                "[Firebase] No analytics document found."
            );

            return null;

        }


        const data =
            snapshot.data();


        return normalizeAnalytics(
            data
        );

    } catch (error) {

        console.error(
            "[Firebase] Failed to load analytics:",
            error
        );


        return null;

    }

}


/* =========================================================
   SAVE ANALYTICS
   ========================================================= */

/*
|--------------------------------------------------------------------------
| saveFirebaseAnalytics
|--------------------------------------------------------------------------
|
| Saves the complete analytics object.
|
| We intentionally use setDoc() rather than trying to
| update individual session fields.
|
| This keeps the Firebase structure synchronized with the
| local analytics structure used by app.js.
|--------------------------------------------------------------------------
*/

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
            getAnalyticsRef();


        if (!reference) {

            return false;

        }


        const cleaned =
            cleanObject(
                normalizeAnalytics(
                    analytics
                )
            );


        cleaned.updatedAt =
            serverTimestamp();


        if (!cleaned.createdAt) {

            cleaned.createdAt =
                serverTimestamp();

        }


        await setDoc(
            reference,
            cleaned,
            {
                merge: false
            }
        );


        console.log(
            "[Firebase] Analytics saved."
        );


        return true;

    } catch (error) {

        console.error(
            "[Firebase] Failed to save analytics:",
            error
        );


        return false;

    }

}


/* =========================================================
   MERGE ANALYTICS
   ========================================================= */

/*
|--------------------------------------------------------------------------
| mergeAnalytics
|--------------------------------------------------------------------------
|
| Used when Firebase already contains data and local data
| also exists.
|
| Sessions are identified using session.id when available.
| Media statistics are merged by media ID.
|--------------------------------------------------------------------------
*/

function mergeAnalytics(
    firebaseData,
    localData
) {

    const firebaseAnalytics =
        normalizeAnalytics(
            firebaseData
        );


    const localAnalytics =
        normalizeAnalytics(
            localData
        );


    /*
     * ------------------------------------------------------
     * Sessions
     * ------------------------------------------------------
     */

    const sessionMap =
        new Map();


    firebaseAnalytics.sessions.forEach(
        session => {

            if (
                session &&
                session.id
            ) {

                sessionMap.set(
                    session.id,
                    session
                );

            }

        }
    );


    localAnalytics.sessions.forEach(
        session => {

            if (
                session &&
                session.id
            ) {

                sessionMap.set(
                    session.id,
                    session
                );

            }

        }
    );


    /*
     * Sessions without IDs are preserved.
     */

    const sessionsWithoutIds = [

        ...firebaseAnalytics.sessions.filter(
            session =>
                !session ||
                !session.id
        ),

        ...localAnalytics.sessions.filter(
            session =>
                !session ||
                !session.id
        )

    ];


    const mergedSessions = [

        ...Array.from(
            sessionMap.values()
        ),

        ...sessionsWithoutIds

    ];


    /*
     * Sort chronologically.
     */

    mergedSessions.sort(
        (
            first,
            second
        ) => {

            const firstTime =
                Number(
                    first?.startedAt ||
                    first?.timestamp ||
                    0
                );


            const secondTime =
                Number(
                    second?.startedAt ||
                    second?.timestamp ||
                    0
                );


            return firstTime - secondTime;

        }
    );


    /*
     * ------------------------------------------------------
     * Media
     * ------------------------------------------------------
     */

    const media = {};


    const firebaseMedia =
        firebaseAnalytics.media || {};


    const localMedia =
        localAnalytics.media || {};


    const mediaIds =
        new Set([
            ...Object.keys(
                firebaseMedia
            ),

            ...Object.keys(
                localMedia
            )

        ]);


    mediaIds.forEach(
        mediaId => {

            const remote =
                firebaseMedia[
                    mediaId
                ];


            const local =
                localMedia[
                    mediaId
                ];


            if (!remote && local) {

                media[mediaId] =
                    cleanObject(
                        local
                    );

                return;

            }


            if (remote && !local) {

                media[mediaId] =
                    cleanObject(
                        remote
                    );

                return;

            }


            if (
                remote &&
                local
            ) {

                media[mediaId] = {

                    ...remote,

                    ...local,

                    views:
                        Math.max(
                            Number(
                                remote.views || 0
                            ),
                            Number(
                                local.views || 0
                            )
                        ),

                    time:
                        Math.max(
                            Number(
                                remote.time || 0
                            ),
                            Number(
                                local.time || 0
                            )
                        )

                };

            }

        }
    );


    return {

        version: 1,

        createdAt:
            firebaseAnalytics.createdAt ||
            localAnalytics.createdAt ||
            null,

        updatedAt:
            Date.now(),

        sessions:
            mergedSessions,

        media

    };

}


/* =========================================================
   SYNC ANALYTICS
   ========================================================= */

/*
|--------------------------------------------------------------------------
| syncAnalytics
|--------------------------------------------------------------------------
|
| Strategy:
|
| 1. Load Firebase
| 2. Read local analytics supplied by app.js
| 3. Merge both
| 4. Save merged result back to Firebase
| 5. Return merged analytics
|
|--------------------------------------------------------------------------
*/

async function syncAnalytics(
    localAnalytics
) {

    if (
        !firebaseReady ||
        !db
    ) {

        return {

            success: false,

            analytics:
                normalizeAnalytics(
                    localAnalytics
                ),

            source:
                "local"

        };

    }


    try {

        const remoteAnalytics =
            await loadFirebaseAnalytics();


        /*
         * No remote data yet.
         */

        if (!remoteAnalytics) {

            const local =
                normalizeAnalytics(
                    localAnalytics
                );


            await saveFirebaseAnalytics(
                local
            );


            return {

                success: true,

                analytics: local,

                source:
                    "local-upload"

            };

        }


        /*
         * Merge local + remote.
         */

        const merged =
            mergeAnalytics(
                remoteAnalytics,
                localAnalytics
            );


        /*
         * Save merged copy.
         */

        await saveFirebaseAnalytics(
            merged
        );


        return {

            success: true,

            analytics: merged,

            source:
                "merged"

        };

    } catch (error) {

        console.error(
            "[Firebase] Sync failed:",
            error
        );


        return {

            success: false,

            analytics:
                normalizeAnalytics(
                    localAnalytics
                ),

            source:
                "local",

            error

        };

    }

}


/* =========================================================
   PUSH SINGLE SESSION
   ========================================================= */

/*
|--------------------------------------------------------------------------
| saveFirebaseSession
|--------------------------------------------------------------------------
|
| Convenience helper if app.js wants to save a completed
| session separately.
|--------------------------------------------------------------------------
*/

async function saveFirebaseSession(
    session,
    currentAnalytics
) {

    if (
        !firebaseReady ||
        !session
    ) {

        return false;

    }


    try {

        const analytics =
            normalizeAnalytics(
                currentAnalytics
            );


        const exists =
            analytics.sessions.some(
                existing =>
                    existing &&
                    session &&
                    existing.id === session.id
            );


        if (!exists) {

            analytics.sessions.push(
                cleanObject(
                    session
                )
            );

        }


        return await saveFirebaseAnalytics(
            analytics
        );

    } catch (error) {

        console.error(
            "[Firebase] Session save failed:",
            error
        );


        return false;

    }

}


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

function isFirebaseReady() {

    return (
        firebaseReady === true &&
        db !== null
    );

}


/* =========================================================
   FIREBASE APP ACCESS
   ========================================================= */

function getFirebaseApp() {

    return firebaseApp;

}


function getFirestoreDB() {

    return db;

}


/* =========================================================
   GLOBAL API
   ========================================================= */

/*
 * app.js can use:
 *
 * window.ArchiveFirebase.isReady()
 *
 * window.ArchiveFirebase.loadAnalytics()
 *
 * window.ArchiveFirebase.saveAnalytics(data)
 *
 * window.ArchiveFirebase.syncAnalytics(data)
 *
 * window.ArchiveFirebase.saveSession(session, data)
 */

window.ArchiveFirebase = {

    isReady:
        isFirebaseReady,

    getApp:
        getFirebaseApp,

    getDB:
        getFirestoreDB,

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

    saveFirebaseSession,

    isFirebaseReady,

    getFirebaseApp,

    getFirestoreDB

};


/* =========================================================
   READY MESSAGE
   ========================================================= */

if (firebaseReady) {

    console.log(
        "[Archive Firebase] Ready."
    );

} else {

    console.log(
        "[Archive Firebase] Local analytics mode."
    );

}