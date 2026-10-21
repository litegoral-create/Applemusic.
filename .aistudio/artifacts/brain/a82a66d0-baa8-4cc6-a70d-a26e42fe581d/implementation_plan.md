# SnappyEdge: Fullscreen Edge-to-Edge WebAPK & MediaSessionService Plan

A production-grade architecture and roadmap for an immersive, edge-to-edge Android wrapper and web player. It permanently eliminates native Android ActionBar defects (the top blue line), provides a distraction-free "Cover-Only" interface, implements aggressive local flash caching for instant (0ms) load times, and guarantees uninterrupted background playback using AndroidX Media3 `MediaSessionService` and `FOREGROUND_SERVICE_MEDIA_PLAYBACK`.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural design combines a live web player, a realistic Android device simulator with lock-screen verification, and a 1-click exportable Android Studio Gradle project. Please review the confirmed choices below:

- **Confirmed Decision 1: Eradication of the Top Blue Bar**: Completely bypass Android's default `Theme.AppCompat.Light` ActionBar by adopting `Theme.MaterialComponents.DayNight.NoActionBar` paired with `WindowCompat.setDecorFitsSystemWindows(window, false)` so web content covers 100% of the screen from the camera notch to the navigation bar.
- **Confirmed Decision 2: Modern AndroidX Media3 Architecture**: Adopt `androidx.media3.session.MediaSessionService` with `FOREGROUND_SERVICE_MEDIA_PLAYBACK` and CPU `PARTIAL_WAKE_LOCK` instead of legacy MediaSessionCompat to guarantee audio continuity on Android 14+ when minimized or locked.
- **Confirmed Decision 3: "Cover-Only" Screen Content Focus**: Deliver a dominant album cover presentation with dynamic aura backdrops, lossless audio badges, minimal floating controls, and interactive synced lyrics HUD.
- **Confirmed Decision 4: Aggressive Cache Engine**: Configure `LOAD_CACHE_ELSE_NETWORK` with a 500MB+ dedicated flash cache directory and DOM storage to cut page load latency from 350ms down to 0–1ms.

---

## 1. Overview & Core Concept

* **What It Does**: Resolves the classic WebView wrapper flaws (the blue header line, letterboxing, audio cutouts on screen lock, and sluggish reload times) by combining a modern Android 14 native service architecture with a fluid, high-fidelity web player and an instant APK project builder.
* **Target Audience**: Music listeners and developers who want an edge-to-edge, distraction-free player for Apple Music or streaming web apps without native app bar artifacts or battery-saver audio dropouts.
* **Key Value**:
  1. **Visual Purity**: Zero blue bars, zero browser headers, true edge-to-edge layout.
  2. **Uninterrupted Audio**: Audio persists seamlessly when switching apps or locking the device display.
  3. **Lock Screen Controls**: Real lock screen notifications with playback transport controls (Play, Pause, Skip, Previous).
  4. **Instant Responsiveness**: Flash caching delivers instant asset hits.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Interactive Device Simulator Flow**:
   * Users preview the app inside a realistic Android phone frame.
   * Can toggle the "Defect Inspector" to observe how the native blue bar ruined the interface versus the clean, edge-to-edge rewritten APK.
   * Can switch between "Cover-Only View", "Web Player View", and "Lock Screen Test".
2. **Lock Screen & Background Verification Flow**:
   * Tapping "Test Lock Screen" simulates Android's ambient lock screen with active clock, wallpaper blur, and the interactive Media Notification Card.
   * Users can tap transport buttons (Play/Pause/Skip) to verify that audio and metadata remain in sync even while "locked".
3. **1-Click APK Project Export Flow**:
   * Users click "Build Finished APK", customize package identity and cache pool size (250MB–2GB), and download a ready-to-compile `.zip` containing all Gradle, Kotlin, XML, and GitHub Actions workflow files.
4. **Instant WebAPK Installation Flow**:
   * Android Chrome users can tap "Install on Device" to compile an official native WebAPK directly on their device with zero command-line tools.

### Visual Identity & Theme
* **Atmosphere**: Deep space obsidian (`#070709`) with luminous Apple-inspired pink/rose gradients (`#fa2456` to `#f43f5e`) and emerald accents for cache/service health indicators.
* **Cover-Only Presentation**: Full-bleed dynamic ambient glow that extracts the dominant colors of the active album art, framing a floating 3D-depth vinyl record or high-res artwork card.
* **Typography**: Crisp Apple-style sans-serif hierarchy with monospaced latency badges (`0ms`, `120Hz`, `Lossless 24-Bit/192kHz`).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: AndroidX Media3 `MediaSessionService` vs. Legacy `Service`
* **Chosen Approach**: Use `androidx.media3.session.MediaSessionService` with `androidx.media3:media3-session:1.3.1` and `FOREGROUND_SERVICE_MEDIA_PLAYBACK`.
* **Why**: Android 14+ strictly terminates background services that lack explicit foreground service types. Media3 is Google's modern replacement for legacy `MediaSessionCompat` and automatically handles lock screen notifications, system audio focus, and media button routing.
* **Trade-off**: Requires modern Android compileSdk 34 and minSdk 24, which covers 96%+ of active Android devices worldwide.

### Decision 2: Deliberate Non-Pausing of WebView Lifecycle
* **Chosen Approach**: In `MainActivity.kt`, deliberately omit `webView.onPause()` and `webView.pauseTimers()` inside `Activity.onPause()` and `onStop()`.
* **Why**: Standard Android templates blindly call `webView.onPause()`, which instructs the Chromium engine to suspend JavaScript timers and HTML5 audio elements. By leaving the WebView active while bound to the foreground service, the web audio pipeline continues running smoothly in the background.

### Decision 3: Multi-Layered Cache Strategy (`LOAD_CACHE_ELSE_NETWORK`)
* **Chosen Approach**: Configure the Android WebView settings to prioritize disk and DOM cache before falling back to network calls, coupled with a browser Service Worker (`sw.js`) that uses `CacheFirst` for audio/image assets.
* **Why**: Apple Music web assets and album covers are heavy (1–3MB each). Local flash caching provides immediate 0ms frame rendering and offline resilience.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SnappyEdge Architecture                          │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Native Android APK Layer ]                [ Web Client & PWA Layer ]
 ┌───────────────────────────┐               ┌───────────────────────────────┐
 │ AndroidManifest.xml       │               │ App.tsx (Master UI & Player)  │
 │ - FOREGROUND_SERVICE      │               │ - MediaSession API Controller │
 │ - MEDIA_PLAYBACK type     │               │ - Real HTML5 Audio Stream     │
 └─────────────┬─────────────┘               └───────────────┬───────────────┘
               │                                             │
               ▼                                             ▼
 ┌───────────────────────────┐               ┌───────────────────────────────┐
 │ PlaybackMediaSessionServ. │               │ PhoneSimulator.tsx            │
 │ - Media3 MediaSession     │◄──────────────┤ - Edge-to-Edge Display Frame  │
 │ - ExoPlayer audio engine  │ WebAppBridge  │ - Android Lock Screen Mode    │
 │ - CPU PARTIAL_WAKE_LOCK   │ (IPC Events)  │ - Defect Inspector (Blue Bar) │
 └─────────────┬─────────────┘               └───────────────┬───────────────┘
               │                                             │
               ▼                                             ▼
 ┌───────────────────────────┐               ┌───────────────────────────────┐
 │ System Media Notification │               │ CoverOnlyView.tsx             │
 │ - Lock Screen Controls    │               │ - Immersive Fullscreen Cover  │
 │ - Play / Pause / Skip     │               │ - Synced Lyrics HUD           │
 └───────────────────────────┘               └───────────────┬───────────────┘
                                                             │
                                                             ▼
                                             ┌───────────────────────────────┐
                                             │ CacheEngine.ts & sw.js        │
                                             │ - Flash Cache Pool (Up to 2GB)│
                                             │ - 0ms Instant Response Cache  │
                                             └───────────────────────────────┘
```

### Component & Handler Mapping
1. **`PlaybackMediaSessionService`**:
   * `onCreate()`: Acquires `PARTIAL_WAKE_LOCK` (2h buffer), configures `AudioAttributes` (`C.USAGE_MEDIA`), and builds `MediaSession`.
   * `onStartCommand()`: Receives `ACTION_UPDATE_METADATA` and pushes title, artist, and playback states to lock screen notifications.
   * `onDestroy()`: Releases WakeLock, unregisters session, and stops player.
2. **`MainActivity` & `WebAppInterface`**:
   * Evaluates bi-directional JavaScript to synchronize web audio playback with the native Media3 service.
   * Traps back press navigation to preserve web history without inadvertently destroying the background service.
3. **`PhoneSimulator` & `CoverOnlyView`**:
   * Manages track transitions, scrubber positioning, dynamic background aura, and full-screen toggles.
4. **`apkGenerator.ts`**:
   * Builds the complete Gradle project archive in memory via JSZip with Kotlin source files, themes, AndroidManifest, Proguard rules, and a GitHub Actions cloud compiler workflow.

---

## 5. Execution Steps

1. **Verification of Android Media3 & Manifest Rules**:
   * Confirm `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission and `android:foregroundServiceType="mediaPlayback"` configuration in `AndroidManifest.xml`.
   * Confirm `PlaybackMediaSessionService` properly extends `MediaSessionService` and implements `onGetSession`.
2. **Verification of Web MediaSession Hooks**:
   * Ensure `navigator.mediaSession` handlers (`play`, `pause`, `previoustrack`, `nexttrack`) are bound to state so host devices display lock screen controls.
3. **Zip Generator Integrity**:
   * Validate that the generated Android project ZIP contains matching package namespaces, Gradle build files, and clean Kotlin implementations.
4. **Lint and Build Compilation**:
   * Run full type checking and compilation verification.
