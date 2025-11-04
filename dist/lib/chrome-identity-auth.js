/**
 * EchoMind Pro – Chrome Identity Auth Module
 * 100% Manifest V3-compliant — no remote scripts, no Firebase Auth.
 * Uses Chrome's built-in Identity API for Google OAuth.
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Firebase configuration (for Firestore only, no Auth)
const firebaseConfig = {
  apiKey: "AIzaSyBjvU60DVPzad8YeejTLovwSuruKL7FG34",
  authDomain: "echomind-pro-launch.firebaseapp.com",
  projectId: "echomind-pro-launch",
  storageBucket: "echomind-pro-launch.firebasestorage.app",
  messagingSenderId: "643933689359",
  appId: "1:643933689359:web:ff44d8beb1947a1404357a"
};

// Initialize Firebase app & Firestore (no Auth)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Google OAuth Client ID for Chrome Extension
// Get this from: https://console.cloud.google.com/apis/credentials
// Type: OAuth 2.0 Client ID → Application type: Chrome Extension
const GOOGLE_CLIENT_ID = "643933689359-9tr6aqdtmnjyketiil6ca5dm0ed22ln4.apps.googleusercontent.com";

/**
 * Sign in with Google using Chrome Identity API
 * @returns {Promise<{token: string, email: string, name: string}>}
 */
export async function signInWithGoogle() {
  return new Promise((resolve, reject) => {
    const redirectUrl = chrome.identity.getRedirectURL();
    
    const authUrl =
      "https://accounts.google.com/o/oauth2/auth" +
      "?client_id=" + encodeURIComponent(GOOGLE_CLIENT_ID) +
      "&response_type=token" +
      "&redirect_uri=" + encodeURIComponent(redirectUrl) +
      "&scope=" + encodeURIComponent("openid email profile");

    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          console.error("[EchoMind Pro] Auth error:", chrome.runtime.lastError);
          return reject(chrome.runtime.lastError);
        }

        try {
          // Parse access token from redirect URL
          const params = new URL(redirectUrl).hash.substring(1).split("&");
          const tokenParam = params.find((p) => p.startsWith("access_token="));
          
          if (!tokenParam) {
            throw new Error("No access token in response");
          }

          const token = tokenParam.split("=")[1];

          // Fetch user info from Google
          const userInfoResponse = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (!userInfoResponse.ok) {
            throw new Error("Failed to fetch user info");
          }

          const userInfo = await userInfoResponse.json();

          // Store user data in Chrome storage
          await chrome.storage.local.set({
            user: {
              token,
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
              signedInAt: Date.now()
            }
          });

          resolve({
            token,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture
          });
        } catch (error) {
          console.error("[EchoMind Pro] Token parsing error:", error);
          reject(error);
        }
      }
    );
  });
}

/**
 * Get current signed-in user from Chrome storage
 * @returns {Promise<{token: string, email: string, name: string} | null>}
 */
export async function getCurrentUser() {
  const result = await chrome.storage.local.get("user");
  return result.user || null;
}

/**
 * Observe auth state changes
 * @param {Function} callback - Called with user object or null
 * @returns {Function} Unsubscribe function
 */
export function observeAuth(callback) {
  // Initial call
  getCurrentUser().then(callback);

  // Listen for storage changes
  const listener = (changes, areaName) => {
    if (areaName === "local" && changes.user) {
      callback(changes.user.newValue || null);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Return unsubscribe function
  return () => chrome.storage.onChanged.removeListener(listener);
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  try {
    const user = await getCurrentUser();
    
    if (user?.token) {
      // Revoke the token
      chrome.identity.removeCachedAuthToken({ token: user.token }, () => {
        console.log("[EchoMind Pro] Token revoked");
      });
    }

    // Clear user data from storage
    await chrome.storage.local.remove("user");
    console.log("[EchoMind Pro] User signed out");
  } catch (err) {
    console.error("[EchoMind Pro] Sign-out error:", err);
  }
}

/**
 * Add a contact message to Firestore
 * @param {string} name 
 * @param {string} email 
 * @param {string} message 
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export async function addContactMessage(name, email, message) {
  try {
    await addDoc(collection(db, "contact_messages"), {
      name,
      email,
      message,
      sent_to: "contact@metalmindtech.com",
      timestamp: serverTimestamp(),
      status: "new",
      source: "dashboard"
    });
    return { success: true };
  } catch (error) {
    console.error("[EchoMind Pro] Firestore write error:", error);
    return { success: false, error };
  }
}

export { db };
