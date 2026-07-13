# Fieldmark — building an offline Android app

**What's in this build:** PDF/DXF/DWG viewing, full-text search, numbered pins with
notes, drawing tools (line/arrow/rectangle/circle/freehand), a Measure tool with
scale calibration for real-world units, an Eraser, and an Export Report button that
generates a printable/PDF summary of every pin and measurement on a drawing.

I can't compile an `.apk` myself in this chat — that needs the Android SDK and Gradle
toolchain, which isn't available in this environment. What I've done instead is make
the app itself fully offline-ready (no CDN calls at runtime, no server, notes/pins/
shapes persisted on-device) and set up everything needed to turn it into a real APK.
Pick whichever route below matches how much setup you want to do.

Everything the app needs is already in `www/` — it works offline once pdf.js is
vendored locally (Route B, step 1) or, for Route A, once it's hosted anywhere.

---

## Route A — No-code, ~10 minutes, produces a real signed APK

Uses [PWABuilder](https://www.pwabuilder.com), Microsoft's free tool that packages
any web app into an Android APK. No coding, no Android Studio.

1. **Host the `www/` folder somewhere** (any static host works — it just needs a URL):
   - Easiest: create a free GitHub repo, drag the contents of `www/` into it, enable
     **Settings → Pages** on the `main` branch. You'll get a URL like
     `https://yourname.github.io/fieldmark/`.
   - Before hosting, run the pdf.js step from Route B (step 1) so the vendored files
     exist — otherwise the PDF viewer won't work.
2. Go to **pwabuilder.com**, paste your hosted URL, click **Start**.
3. Click **Package for Stores → Android**, keep the defaults, and download the
   generated APK (it'll be signed with a debug key, installable immediately;
   PWABuilder also gives you the option to provide your own signing key for the
   Play Store).
4. Transfer the `.apk` to your phone and install it (enable "install unknown apps"
   for whichever app you use to open it).

This route also means the app auto-updates whenever you push changes to the hosted
`www/` files — no rebuilding an APK for every tweak.

---

## Route B — Capacitor + Android Studio, fully offline, no hosting needed

Gives you a real native Android project you build and own. Needs
[Node.js](https://nodejs.org) and [Android Studio](https://developer.android.com/studio)
installed on your machine.

```bash
cd fieldmark-android

# 1. Install dependencies and vendor pdf.js locally (required for offline use —
#    the shipped index.html points at ./vendor/pdf.min.js, not a CDN)
npm install
npm run vendor:pdfjs

# 2. Generate the native Android project (creates android/ — this is the large
#    Gradle project I can't hand-write; Capacitor generates it for you)
npm run android:add

# 3. Copy the web assets into it
npm run android:sync

# 4. Open it in Android Studio
npm run android:open
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**. The output
`.apk` lands in `android/app/build/outputs/apk/debug/`. Install it on a device via
USB debugging, or copy the file over and open it.

Because pdf.js is vendored locally and there's no other network call at runtime,
this build works with the device in airplane mode from the first launch.

To publish to the Play Store instead of sideloading, use **Build → Generate Signed
Bundle / APK** with your own keystore.

---

## Route C — Fastest to try, no APK at all

Open `www/index.html` on your phone (host it anywhere, even a temporary link), then
**Chrome menu → Add to Home Screen**. It installs an icon and opens full-screen like
an app, and after the first load the service worker (`service-worker.js`) caches
everything so it keeps working offline. This is a genuine PWA install, just not a
`.apk` file — good for trying it before committing to Route A or B.

---

## What's already handled for offline use

- **Storage**: `index.html` includes a small polyfill so notes/pins save to the
  device's `localStorage` when there's no Claude.ai host providing `window.storage`
  (i.e. whenever this runs standalone, as it will in the APK).
- **PDF rendering**: points at `./vendor/pdf.min.js` — run `npm run vendor:pdfjs`
  (Route B) or otherwise place `pdf.min.js` and `pdf.worker.min.js` from the
  [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist) npm package into
  `www/vendor/` yourself.
- **Fonts**: the Google Fonts link is progressive enhancement only — if it can't
  load (offline, first run before caching), the UI falls back to the device's system
  fonts and still looks fine.
- **DWG**: still shown as a converted sample preview, same as in the browser
  prototype — see the caveat in our earlier conversation about why DWG can't be
  parsed client-side at all (proprietary binary format; real support needs a
  conversion step via ODA File Converter or Autodesk Platform Services).

## Files in this project

```
fieldmark-android/
├── www/                     the actual app (open index.html directly to test in a browser)
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   ├── icons/
│   └── vendor/              pdf.min.js + pdf.worker.min.js go here (npm run vendor:pdfjs)
├── scripts/copy-pdfjs.js
├── package.json
├── capacitor.config.json
└── README.md
```
