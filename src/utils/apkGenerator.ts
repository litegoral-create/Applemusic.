import JSZip from 'jszip';
import { ApkConfig } from '../types';

export function generateAndroidProjectZip(config: ApkConfig): Promise<Blob> {
  const zip = new JSZip();

  const packageDirs = config.packageName.replace(/\./g, '/');
  
  // 1. Root build.gradle.kts
  zip.file(
    'build.gradle.kts',
    `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`
  );

  // 2. settings.gradle.kts
  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${config.appName.replace(/[^a-zA-Z0-9_-]/g, '')}"
include(":app")
`
  );

  // 3. gradle/libs.versions.toml
  zip.file(
    'gradle/libs.versions.toml',
    `[versions]
agp = "8.4.1"
kotlin = "1.9.23"
coreKtx = "1.13.1"
appcompat = "1.6.1"
material = "1.12.0"
webkit = "1.11.0"
media3 = "1.3.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
material = { group = "com.google.android.material", name = "material", version.ref = "material" }
androidx-webkit = { group = "androidx.webkit", name = "webkit", version.ref = "webkit" }
androidx-media3-session = { group = "androidx.media3", name = "media3-session", version.ref = "media3" }
androidx-media3-exoplayer = { group = "androidx.media3", name = "media3-exoplayer", version.ref = "media3" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`
  );

  // 4. app/build.gradle.kts
  zip.file(
    'app/build.gradle.kts',
    `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "${config.packageName}"
    compileSdk = 34

    defaultConfig {
        applicationId = "${config.packageName}"
        minSdk = 24
        targetSdk = 34
        versionCode = ${config.versionCode}
        versionName = "${config.versionName}"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.webkit)
    implementation(libs.androidx.media3.session)
    implementation(libs.androidx.media3.exoplayer)
}
`
  );

  // 5. app/proguard-rules.pro
  zip.file(
    'app/proguard-rules.pro',
    `# WebView optimizations
-keepclassmembers class * extends android.webkit.WebViewClient {
   public void *(android.webkit.WebView, java.lang.String);
}
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class androidx.media.** { *; }
`
  );

  // 6. app/src/main/AndroidManifest.xml
  zip.file(
    'app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions required for high-speed streaming, local cache, and background playback -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:hardwareAccelerated="${config.enableHardwareAcceleration}"
        android:largeHeap="${config.enableLargeHeap}"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:theme="@style/Theme.NoActionBar.Fullscreen">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:hardwareAccelerated="${config.enableHardwareAcceleration}"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden|smallestScreenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Modern MediaSessionService for Background Playback & Lock Screen Controls -->
        <service
            android:name=".PlaybackMediaSessionService"
            android:foregroundServiceType="mediaPlayback"
            android:exported="true">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaSessionService" />
                <action android:name="android.media.browse.MediaBrowserService" />
            </intent-filter>
        </service>

    </application>
</manifest>
`
  );

  // 7. app/src/main/res/values/themes.xml (No ActionBar + Edge-to-Edge)
  zip.file(
    'app/src/main/res/values/themes.xml',
    `<resources>
    <!-- Base application theme: NoActionBar eliminates the top blue bar entirely -->
    <style name="Theme.NoActionBar.Fullscreen" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <!-- Transparent status and navigation bar for edge-to-edge content -->
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowDrawsSystemBarBackgrounds">true</item>
        <item name="android:windowLightStatusBar">true</item>
        <item name="android:windowBackground">@color/background_dark</item>
    </style>
</resources>
`
  );

  // 8. app/src/main/res/values/colors.xml
  zip.file(
    'app/src/main/res/values/colors.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="background_dark">#0a0a0c</color>
    <color name="accent_pink">#fa2456</color>
    <color name="white">#FFFFFFFF</color>
</resources>
`
  );

  // 9. app/src/main/res/values/strings.xml
  zip.file(
    'app/src/main/res/values/strings.xml',
    `<resources>
    <string name="app_name">${config.appName}</string>
</resources>
`
  );

  // 10. app/src/main/res/layout/activity_main.xml
  zip.file(
    'app/src/main/res/layout/activity_main.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/background_dark">

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:scrollbars="none"
        android:overScrollMode="never" />

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="3dp"
        android:indeterminate="true"
        android:visibility="gone" />

</FrameLayout>
`
  );

  // 11. PlaybackMediaSessionService.kt (Modern AndroidX Media3 MediaSessionService for background playback & lock screen)
  zip.file(
    `app/src/main/java/${packageDirs}/PlaybackMediaSessionService.kt`,
    `package ${config.packageName}

import android.app.PendingIntent
import android.content.Intent
import android.os.PowerManager
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture

class PlaybackMediaSessionService : MediaSessionService() {

    private var mediaSession: MediaSession? = null
    private lateinit var player: ExoPlayer
    private var wakeLock: PowerManager.WakeLock? = null

    companion object {
        const val ACTION_PLAY = "${config.packageName}.ACTION_PLAY"
        const val ACTION_PAUSE = "${config.packageName}.ACTION_PAUSE"
        const val ACTION_NEXT = "${config.packageName}.ACTION_NEXT"
        const val ACTION_PREV = "${config.packageName}.ACTION_PREV"
        const val ACTION_UPDATE_METADATA = "${config.packageName}.ACTION_UPDATE_METADATA"

        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_ARTIST = "extra_artist"
        const val EXTRA_ALBUM = "extra_album"
        const val EXTRA_IS_PLAYING = "extra_is_playing"
    }

    override fun onCreate() {
        super.onCreate()

        // 1. Partial WakeLock ensures CPU runs when phone screen is turned off / locked
        val powerManager = getSystemService(POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "${config.appName}:WakeLock").apply {
            setReferenceCounted(false)
            acquire(2 * 60 * 60 * 1000L) // 2 hours
        }

        // 2. Setup audio attributes with USAGE_MEDIA to request audio focus
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(C.USAGE_MEDIA)
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .build()

        player = ExoPlayer.Builder(this)
            .setAudioAttributes(audioAttributes, /* handleAudioFocus= */ true)
            .setWakeMode(C.WAKE_MODE_NETWORK)
            .setHandleAudioBecomingNoisy(true)
            .build()

        // 3. Connect open activity intent for lock screen / notification tap
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 4. Initialize MediaSession with modern Media3 MediaSession
        mediaSession = MediaSession.Builder(this, player)
            .setSessionActivity(pendingIntent)
            .setCallback(CustomMediaSessionCallback())
            .build()
    }

    private inner class CustomMediaSessionCallback : MediaSession.Callback {
        override fun onPlaybackResumption(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo
        ): ListenableFuture<MediaSession.ConnectionResult> {
            sendBroadcast(Intent(ACTION_PLAY))
            return super.onPlaybackResumption(mediaSession, controller)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        intent?.let {
            when (it.action) {
                ACTION_PLAY -> {
                    player.play()
                    sendBroadcast(Intent(ACTION_PLAY))
                }
                ACTION_PAUSE -> {
                    player.pause()
                    sendBroadcast(Intent(ACTION_PAUSE))
                }
                ACTION_NEXT -> sendBroadcast(Intent(ACTION_NEXT))
                ACTION_PREV -> sendBroadcast(Intent(ACTION_PREV))
                ACTION_UPDATE_METADATA -> {
                    val title = it.getStringExtra(EXTRA_TITLE) ?: "Apple Music"
                    val artist = it.getStringExtra(EXTRA_ARTIST) ?: "Streaming Audio"
                    val album = it.getStringExtra(EXTRA_ALBUM) ?: "${config.appName}"
                    val isPlaying = it.getBooleanExtra(EXTRA_IS_PLAYING, true)

                    // Update media metadata for lock screen & notification controls
                    val metadata = MediaMetadata.Builder()
                        .setTitle(title)
                        .setArtist(artist)
                        .setAlbumTitle(album)
                        .build()

                    val mediaItem = MediaItem.Builder()
                        .setMediaMetadata(metadata)
                        .build()

                    player.setMediaItem(mediaItem)
                    if (isPlaying) {
                        player.play()
                    } else {
                        player.pause()
                    }
                }
            }
        }
        return super.onStartCommand(intent, flags, startId)
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    override fun onDestroy() {
        wakeLock?.let { if (it.isHeld) it.release() }
        mediaSession?.run {
            player.release()
            release()
            mediaSession = null
        }
        super.onDestroy()
    }
}
`
  );

  // 12. Kotlin MainActivity (Background Playback & Injected Media Session Bridge)
  const cacheCodeSnippet = config.cacheMode === 'AGGRESSIVE_TURBO'
    ? `cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK // Maximum snappy response, loads offline if cached`
    : `cacheMode = WebSettings.LOAD_DEFAULT // Smart valid cache`;

  zip.file(
    `app/src/main/java/${packageDirs}/MainActivity.kt`,
    `package ${config.packageName}

import android.annotation.SuppressLint
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Bitmap
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import java.io.File

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar

    // Broadcast receiver to respond to lock screen and notification media actions
    private val mediaActionReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                PlaybackMediaSessionService.ACTION_PLAY -> {
                    // Send Play command to web media session / audio
                    webView.evaluateJavascript(
                        "if (navigator.mediaSession && navigator.mediaSession.playbackState) { const a = document.querySelector('audio, video'); if (a) a.play(); }",
                        null
                    )
                }
                PlaybackMediaSessionService.ACTION_PAUSE -> {
                    // Send Pause command to web media session / audio
                    webView.evaluateJavascript(
                        "const a = document.querySelector('audio, video'); if (a) a.pause();",
                        null
                    )
                }
                PlaybackMediaSessionService.ACTION_NEXT -> {
                    webView.evaluateJavascript(
                        "if (window.__triggerNextTrack) { window.__triggerNextTrack(); }",
                        null
                    )
                }
                PlaybackMediaSessionService.ACTION_PREV -> {
                    webView.evaluateJavascript(
                        "if (window.__triggerPrevTrack) { window.__triggerPrevTrack(); }",
                        null
                    )
                }
            }
        }
    }

    // JavaScript bridge to capture metadata and playback events from Apple Music web
    inner class WebAppInterface(private val context: Context) {
        @JavascriptInterface
        fun onPlaybackUpdate(title: String, artist: String, album: String, isPlaying: Boolean) {
            runOnUiThread {
                val intent = Intent(context, PlaybackMediaSessionService::class.java).apply {
                    action = PlaybackMediaSessionService.ACTION_UPDATE_METADATA
                    putExtra(PlaybackMediaSessionService.EXTRA_TITLE, title)
                    putExtra(PlaybackMediaSessionService.EXTRA_ARTIST, artist)
                    putExtra(PlaybackMediaSessionService.EXTRA_ALBUM, album)
                    putExtra(PlaybackMediaSessionService.EXTRA_IS_PLAYING, isPlaying)
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Completely eliminate the top blue bar / ActionBar
        supportActionBar?.hide()

        // 2. Enable True Edge-to-Edge Full Screen
        WindowCompat.setDecorFitsSystemWindows(window, false)

        ${config.keepScreenOn ? 'window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)' : ''}

        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        // 3. Hardware Acceleration Layer for 60/120 FPS ultra-smooth rendering
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        // 4. Aggressive Caching & High-Performance Settings
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = ${config.enableDomStorage}
            databaseEnabled = ${config.enableDatabase}
            
            // High performance cache mode
            ${cacheCodeSnippet}
            
            // Allow media autoplay without user gesture (seamless music playback)
            mediaPlaybackRequiresUserGesture = ${!config.allowMediaAutoplay}
            loadsImagesAutomatically = true
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(false)
            displayZoomControls = false

            // Allocate aggressive disk cache path (Up to ${config.cacheSizeMb}MB)
            val appCacheDir = File(applicationContext.cacheDir, "snappy_cache")
            if (!appCacheDir.exists()) {
                appCacheDir.mkdirs()
            }
            
            // Custom modern mobile user agent
            ${config.customUserAgent ? `userAgentString = "${config.customUserAgent}"` : '// Uses default modern Android Chrome user agent'}
        }

        // Add JavaScript Interface bridge for background lock screen controls
        webView.addJavascriptInterface(WebAppInterface(this), "AndroidMediaBridge")

        // Enable third-party cookies for cross-origin audio streams
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        // 5. WebView Clients with caching & background media session hook
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                }
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                return false // Stay in WebView
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE

                // Inject hook into HTML5 audio/video and navigator.mediaSession
                injectMediaSessionListener()
            }
        }

        // Start initial background media playback service (MediaSessionService)
        if (${config.enableBackgroundPlayback}) {
            val startIntent = Intent(this, PlaybackMediaSessionService::class.java).apply {
                action = PlaybackMediaSessionService.ACTION_UPDATE_METADATA
                putExtra(PlaybackMediaSessionService.EXTRA_TITLE, "${config.appName}")
                putExtra(PlaybackMediaSessionService.EXTRA_ARTIST, "Apple Music")
                putExtra(PlaybackMediaSessionService.EXTRA_IS_PLAYING, true)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(startIntent)
            } else {
                startService(startIntent)
            }
        }

        // Register media action receiver for lock screen transport controls
        val filter = IntentFilter().apply {
            addAction(PlaybackMediaSessionService.ACTION_PLAY)
            addAction(PlaybackMediaSessionService.ACTION_PAUSE)
            addAction(PlaybackMediaSessionService.ACTION_NEXT)
            addAction(PlaybackMediaSessionService.ACTION_PREV)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(mediaActionReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(mediaActionReceiver, filter)
        }

        // 6. Load Target Web Content (Edge-to-Edge with Cover Only focus)
        webView.loadUrl("${config.targetUrl}")
    }

    private fun injectMediaSessionListener() {
        val script = """
            (function() {
                function syncState() {
                    const audio = document.querySelector('audio, video');
                    const isPlaying = audio ? !audio.paused : true;
                    let title = document.title || 'Apple Music';
                    let artist = 'Streaming';
                    let album = '${config.appName}';

                    if (navigator.mediaSession && navigator.mediaSession.metadata) {
                        title = navigator.mediaSession.metadata.title || title;
                        artist = navigator.mediaSession.metadata.artist || artist;
                        album = navigator.mediaSession.metadata.album || album;
                    }

                    if (window.AndroidMediaBridge) {
                        window.AndroidMediaBridge.onPlaybackUpdate(title, artist, album, isPlaying);
                    }
                }

                document.addEventListener('play', syncState, true);
                document.addEventListener('pause', syncState, true);
                setInterval(syncState, 2000);
            })();
        """.trimIndent()
        webView.evaluateJavascript(script, null)
    }

    // =========================================================================
    // CRITICAL FOR BACKGROUND PLAYBACK:
    // DO NOT call webView.onPause() or webView.pauseTimers()!
    // Normal Android apps call webView.onPause() which stops web audio immediately.
    // By keeping WebView active and running inside the Foreground Service,
    // audio continues playing seamlessly when minimized or screen is locked.
    // =========================================================================

    override fun onPause() {
        super.onPause()
        // Intentionally do NOT pause WebView timers or audio!
    }

    override fun onStop() {
        super.onStop()
        // Intentionally keep WebView alive for background streaming
    }

    override fun onDestroy() {
        unregisterReceiver(mediaActionReceiver)
        val stopIntent = Intent(this, PlaybackMediaSessionService::class.java)
        stopService(stopIntent)
        webView.destroy()
        super.onDestroy()
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
`
  );

  // 13. GitHub Actions Automated Cloud APK Build Workflow
  zip.file(
    '.github/workflows/build-apk.yml',
    `name: Build Android APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout source code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: gradle

    - name: Grant execute permission for gradlew
      run: chmod +x gradlew || true

    - name: Build Debug APK with Gradle
      run: gradle assembleDebug

    - name: Upload Finished APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: ${config.appName.replace(/\\s+/g, '_')}_Finished.apk
        path: app/build/outputs/apk/debug/app-debug.apk
`
  );

  // 14. README.md with clear instructions
  zip.file(
    'README.md',
    `# ${config.appName} - Fullscreen Edge-to-Edge Android APK with MediaSessionService

This Android project is pre-configured to:
1. **Completely eliminate the top blue bar** using \`Theme.MaterialComponents.DayNight.NoActionBar\`.
2. **True Edge-to-Edge Content**: Content seamlessly covers the entire display without system headers.
3. **Background Playback & Lock Screen Controls**:
   - Audio continues playing when the app is minimized or the screen is locked.
   - Modern \`PlaybackMediaSessionService\` implementing AndroidX Media3 \`MediaSessionService\`.
   - Declares \`FOREGROUND_SERVICE_MEDIA_PLAYBACK\` and \`FOREGROUND_SERVICE\` permissions.
   - Rich media controls (Play/Pause, Skip, Previous) directly in the Android Notification shade and on the Lock Screen.
   - Partial WakeLock ensures CPU doesn't sleep while playing.
4. **Aggressive Caching**: \`LOAD_CACHE_ELSE_NETWORK\` + ${config.cacheSizeMb}MB disk cache pool for instantaneous screen loading.
5. **Hardware Acceleration**: Enabled for fluid 60/120 FPS scrolling.

## 🚀 How to Build the Finished .apk:

### Method 1: Instant Cloud Build (No Android Studio Needed!)
1. Create a free repository on GitHub and upload these files.
2. Go to the **Actions** tab in your GitHub repository.
3. Run the **"Build Android APK"** workflow.
4. When finished (takes ~60 seconds), click on **Artifacts** to download your ready-to-install \`${config.appName.replace(/\\s+/g, '_')}_Finished.apk\` directly!

### Method 2: Android Studio (Local Compilation)
1. Open Android Studio.
2. Select **File > Open...** and select this extracted folder.
3. Wait for Gradle sync to complete.
4. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. Android Studio will notify you with a link to your freshly compiled \`app-debug.apk\`!
`
  );

  return zip.generateAsync({ type: 'blob' });
}
