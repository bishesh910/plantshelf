// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your existing config:
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// ✅ Pin session persistence to local (survives refreshes, tabs)
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((e) => {
  // Non-fatal; log for diagnostics
  console.warn("Auth persistence fallback:", e);
});

export const db = getFirestore(app);

// App Check (send tokens in both dev & prod if key exists)
const siteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;
if (siteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}
