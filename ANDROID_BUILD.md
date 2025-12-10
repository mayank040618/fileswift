# 🤖 Build Android App (TWA) for Play Store

Turn your FileSwift PWA into a native Android App using Trusted Web Activities (TWA).

## 1. Prerequisites
- **Node.js** (You already have this)
- **Google Play Developer Account** ($25 onetime fee)
- **Bubblewrap CLI** (Google's official tool)

## 2. Install Bubblewrap
Open your terminal and run:
```bash
npm install -g @bubblewrap/cli
```

## 3. Prepare your PWA
1.  **Deploy your latest code** to Vercel (Make sure the new `manifest.ts` and icons are live).
    - Checks: Go to `https://your-site.vercel.app/manifest.webmanifest` and ensure it loads JSON.

## 4. Initialize Android Project
Run this command in a new folder (e.g., `fileswift-android`):

```bash
mkdir fileswift-android
cd fileswift-android
bubblewrap init --manifest https://fileswift-app.vercel.app/manifest.webmanifest
```

**Answer the Prompts:**
- **Domain**: `fileswift-app.vercel.app`
- **App Name**: FileSwift
- **Launcher Color**: `#0f172a`
- **Maskable Icon**: Yes (it uses your new icons)

## 5. Build the App (.aab)
```bash
bubblewrap build
```
*It may ask to install JDK/Android SDK. Say "Yes" to everything.*

**Output:**
- You will get an `app-release-bundle.aab`.
- **This is the file you upload to Google Play Console.**

## 6. Remove the URL Bar (Verification)
For the app to look native (no browser bar), you need to prove you own the website.

1.  **Get your SHA-256 Fingerprint**:
    - Bubblewrap gave you this during the build, or run `keytool -list -v -keystore android.keystore`.
2.  **Create Digital Asset Links**:
    - Use [Google's Tool](https://developers.google.com/digital-asset-links/tools/generator).
3.  **Add to Next.js**:
    - Create a file `apps/web/public/.well-known/assetlinks.json`.
    - Paste the JSON content there.
4.  **Redeploy Vercel**.

Once Google Play sees this file on your site, the URL bar disappears! 🪄
