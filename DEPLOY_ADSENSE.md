# 💰 AdSense & Monetization Deployment Guide

This guide walks you through setting up Google AdSense for FileSwift.

## 1. Prerequisites
*   **A Real Domain**: Google AdSense rarely approves `.vercel.app` subdomains. You should buy a domain (e.g., `yourtool.com`).
*   **Privacy Policy**: We created one at `/privacy-policy`. Ensure it is visible.

## 2. AdSense Registration
1.  Go to [Google AdSense](https://adsense.google.com/).
2.  Click **Get Started**.
3.  Enter your website URL (without `https://`, e.g., `fileswift.tools`).
4.  Follow the verification steps.

## 3. Configuration
Once you have your AdSense account:

### Get your Publisher ID
It looks like `pub-1234567890123456`.

### Configure Environment Variables
You must set these in **Vercel** (for Frontend) and **Render** (optional, mostly for tracking).

| Variable | Value Example | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `1234567890123456` | Your AdSense Publisher ID (Numbers Only) |
| `NEXT_PUBLIC_ADSENSE_LOAD_CONSENT_REQUIRED` | `true` | Set to `true` to require GDPR consent before loading ads. |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | `G-XXXXXXXX` | (Optional) Google Analytics 4 ID |

## 4. Verification & Smoke Tests
We have added a safety check script.

Run this locally or in CI to ensure you didn't accidentally hardcode credentials:
```bash
node scripts/smoke-check-ads.js
```

## 5. Wait for Approval
Start writing content or sharing your tool. AdSense usually takes **2-14 days** to review your site.
Until then, the ad spaces will be blank or show a placeholder (in development mode).

---
**⚠️ Compliance Note**:
*   Never click your own ads.
*   Do not ask friends to click ads.
*   Google bans accounts for "invalid traffic" very quickly.
