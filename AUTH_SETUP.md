# 🔐 EchoMind Pro - Firebase Authentication Setup

## Overview

This guide connects Firebase Authentication to your Chrome Extension, enabling users to sign in and access Pro features based on their subscription status.

---

## 🎯 Authentication Flow

```
User Signs In → Firebase Auth → Extension Stores UID/Email → 
Checks Subscription via checkSubscription Function → 
Enables/Disables Pro Features
```

---

## 📋 Step 1: Enable Firebase Authentication

### In Firebase Console:

1. Go to **Firebase Console** → **Build** → **Authentication**
2. Click **Get Started**
3. Enable these sign-in methods:
   - ✅ **Google** (recommended for quick setup)
   - ✅ **Email/Password** (for traditional login)
   - ⚪ **Anonymous** (optional, for trial users)

### Add Authorized Domains:

1. In Authentication → **Settings** → **Authorized domains**
2. Add your extension ID:
   ```
   chrome-extension://YOUR_EXTENSION_ID
   ```
3. For testing, `localhost` is already authorized

---

## 📋 Step 2: Update Firebase Config

Your Firebase config is already set up in `src/lib/firebase.js`:

```javascript
// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBjvU60DVPzad8YeejTLovwSuruKL7FG34",
  authDomain: "echomind-pro-launch.firebaseapp.com",
  projectId: "echomind-pro-launch",
  storageBucket: "echomind-pro-launch.firebasestorage.app",
  messagingSenderId: "643933689359",
  appId: "1:643933689359:web:ff44d8beb1947a1404357a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
```

✅ Already configured - no changes needed!

---

## 📋 Step 3: Add Authentication UI

### Option A: Simple Popup Sign-In

Create `src/auth/AuthPopup.tsx` (or `.jsx`):

```typescript
import React, { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

const provider = new GoogleAuthProvider();

export function AuthPopup() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Store user info in Chrome storage
      if (currentUser) {
        chrome.storage.sync.set({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL
        });
      } else {
        chrome.storage.sync.remove(['uid', 'email', 'displayName', 'photoURL']);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign-in error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {user ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-semibold">{user.displayName}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
      )}
    </div>
  );
}
```

### Option B: Vanilla JavaScript (No React)

Create `src/auth/auth.js`:

```javascript
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const provider = new GoogleAuthProvider();

// Initialize auth state listener
export function initAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      chrome.storage.sync.set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });
      
      updateUI(user);
    } else {
      // User is signed out
      chrome.storage.sync.remove(['uid', 'email', 'displayName', 'photoURL']);
      updateUI(null);
    }
  });
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Sign-in error:', error);
    alert('Failed to sign in. Please try again.');
  }
}

// Sign out
export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
  }
}

// Update UI based on auth state
function updateUI(user) {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userInfo = document.getElementById('user-info');
  
  if (user) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    userInfo.textContent = `Signed in as ${user.email}`;
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    userInfo.textContent = 'Not signed in';
  }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  
  document.getElementById('login-btn')?.addEventListener('click', signInWithGoogle);
  document.getElementById('logout-btn')?.addEventListener('click', signOutUser);
});
```

---

## 📋 Step 4: Check Subscription Status

Create `src/utils/subscription.js`:

```javascript
const SUBSCRIPTION_API = 'https://us-central1-echomind-pro-launch.cloudfunctions.net/checkSubscription';

/**
 * Check if user has active subscription
 * @returns {Promise<{status: string, isPro: boolean}>}
 */
export async function checkSubscription() {
  try {
    // Get user email from Chrome storage
    const { email, uid } = await chrome.storage.sync.get(['email', 'uid']);
    
    if (!email && !uid) {
      return { status: 'free', isPro: false };
    }

    // Call Firebase Function
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (uid) params.append('uid', uid);
    
    const response = await fetch(`${SUBSCRIPTION_API}?${params}`);
    const data = await response.json();
    
    return {
      status: data.status,
      isPro: data.status === 'active',
      lastUpdated: data.last_updated
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { status: 'error', isPro: false };
  }
}

/**
 * Enable/disable features based on subscription
 */
export async function updateFeatureAccess() {
  const { isPro } = await checkSubscription();
  
  // Store subscription status
  await chrome.storage.local.set({ isPro });
  
  // Update UI or enable/disable features
  if (isPro) {
    console.log('✅ Pro features enabled');
    enableProFeatures();
  } else {
    console.log('⚠️ Free tier - Pro features disabled');
    showUpgradePrompt();
  }
}

function enableProFeatures() {
  // Enable advanced AI features
  // Unlock unlimited summaries
  // Enable custom prompts
  // etc.
}

function showUpgradePrompt() {
  // Show "Upgrade to Pro" button
  // Limit features to free tier
}
```

---

## 📋 Step 5: Integrate into Extension

### In your popup or background script:

```javascript
import { initAuth } from './auth/auth';
import { checkSubscription, updateFeatureAccess } from './utils/subscription';

// Initialize on extension load
initAuth();
updateFeatureAccess();

// Check subscription periodically (every 5 minutes)
setInterval(updateFeatureAccess, 5 * 60 * 1000);

// Example: Gate a Pro feature
async function handleSummarize() {
  const { isPro } = await chrome.storage.local.get('isPro');
  
  if (!isPro) {
    alert('This feature requires EchoMind Pro. Upgrade now!');
    // Show upgrade link
    return;
  }
  
  // Proceed with Pro feature
  performAdvancedSummarization();
}
```

---

## 📋 Step 6: Update Manifest Permissions

Add to `manifest.json`:

```json
{
  "permissions": [
    "storage",
    "identity"
  ],
  "host_permissions": [
    "https://echomind-pro-launch.firebaseapp.com/*",
    "https://us-central1-echomind-pro-launch.cloudfunctions.net/*"
  ]
}
```

---

## 🧪 Testing

### Test Sign-In Flow:

1. Load extension in Chrome
2. Click extension icon → Sign in with Google
3. Complete OAuth flow
4. Check Chrome DevTools → Application → Storage → chrome.storage
5. Verify `uid` and `email` are stored

### Test Subscription Check:

```javascript
// In browser console
chrome.storage.sync.get(['email'], async ({ email }) => {
  const res = await fetch(`https://us-central1-echomind-pro-launch.cloudfunctions.net/checkSubscription?email=${email}`);
  const data = await res.json();
  console.log('Subscription status:', data);
});
```

---

## 🔒 Security Best Practices

### Current Setup (Open CORS):
- ✅ Good for development
- ✅ Easy to test
- ⚠️ Anyone can query any email

### Production Hardening (Optional):

Update `functions/index.js` to verify Firebase ID tokens:

```javascript
exports.checkSubscription = functions.https.onRequest(async (req, res) => {
  try {
    // Verify Firebase ID token
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    
    // Now only authenticated users can check their own status
    const userDoc = await db.collection("user_subscription_status").doc(uid).get();
    
    // ... rest of logic
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});
```

Then in your extension, send the ID token:

```javascript
const user = auth.currentUser;
const idToken = await user.getIdToken();

const response = await fetch(SUBSCRIPTION_API, {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
```

---

## 📊 Firestore Data Structure

### Collection: `user_subscription_status`

```javascript
// Document ID: user email or UID
{
  "user@example.com": {
    status: "active",           // "active" | "free" | "canceled"
    lastUpdated: Timestamp,
    stripeCustomerId: "cus_xxx" // optional
  }
}
```

### Collection: `profiles` (optional, for richer data)

```javascript
// Document ID: Firebase UID
{
  "firebase_uid_123": {
    email: "user@example.com",
    displayName: "John Doe",
    photoURL: "https://...",
    stripeCustomerId: "cus_xxx",
    plan: "pro",
    createdAt: Timestamp,
    lastSynced: Timestamp
  }
}
```

---

## 🚀 Deployment Checklist

- [ ] Enable Firebase Authentication (Google + Email)
- [ ] Add authorized domain (extension ID)
- [ ] Update `manifest.json` permissions
- [ ] Implement sign-in UI
- [ ] Integrate `checkSubscription` API
- [ ] Test sign-in flow
- [ ] Test subscription check
- [ ] Deploy functions: `.\deploy-webhook.ps1`
- [ ] Configure Stripe webhook
- [ ] Test end-to-end payment → auth flow

---

## 📚 Resources

- [Firebase Auth for Extensions](https://firebase.google.com/docs/auth/web/chrome-extension)
- [Chrome Extension Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Firebase Auth Best Practices](https://firebase.google.com/docs/auth/web/best-practices)

---

**Ready to add authentication?** Follow the steps above and run `.\deploy-webhook.ps1` to deploy both functions! 🔥
