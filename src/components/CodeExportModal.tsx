import React, { useState } from 'react';
import { X, Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<'service' | 'themes' | 'mainActivity' | 'manifest' | 'githubAction'>('service');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeSnippets = {
    service: `// app/src/main/java/com/applemusic/snappy/PlaybackMediaSessionService.kt
// AndroidX Media3 MediaSessionService implementation for background playback
package com.applemusic.snappy

import android.app.PendingIntent
import android.content.Intent
import android.os.PowerManager
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.google.common.util.concurrent.ListenableFuture

class PlaybackMediaSessionService : MediaSessionService() {

    private var mediaSession: MediaSession? = null
    private lateinit var player: ExoPlayer
    private var wakeLock: PowerManager.WakeLock? = null

    companion object {
        const val ACTION_PLAY = "com.applemusic.snappy.ACTION_PLAY"
        const val ACTION_PAUSE = "com.applemusic.snappy.ACTION_PAUSE"
        const val ACTION_NEXT = "com.applemusic.snappy.ACTION_NEXT"
        const val ACTION_PREV = "com.applemusic.snappy.ACTION_PREV"
        const val ACTION_UPDATE_METADATA = "com.applemusic.snappy.ACTION_UPDATE_METADATA"

        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_ARTIST = "extra_artist"
        const val EXTRA_ALBUM = "extra_album"
        const val EXTRA_IS_PLAYING = "extra_is_playing"
    }

    override fun onCreate() {
        super.onCreate()

        // 1. Partial WakeLock prevents CPU sleep when phone screen is locked
        val pm = getSystemService(POWER_SERVICE) as PowerManager
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Snappy:MusicWakeLock").apply {
            acquire(2 * 60 * 60 * 1000L) // 2 hours
        }

        // 2. Setup AudioAttributes with USAGE_MEDIA to request audio focus
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(C.USAGE_MEDIA)
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .build()

        player = ExoPlayer.Builder(this)
            .setAudioAttributes(audioAttributes, true)
            .setWakeMode(C.WAKE_MODE_NETWORK)
            .setHandleAudioBecomingNoisy(true)
            .build()

        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 3. Build Media3 MediaSession (automatically publishes notification & lock screen controls)
        mediaSession = MediaSession.Builder(this, player)
            .setSessionActivity(pendingIntent)
            .build()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        intent?.let {
            when (it.action) {
                ACTION_PLAY -> player.play()
                ACTION_PAUSE -> player.pause()
                ACTION_NEXT -> sendBroadcast(Intent(ACTION_NEXT))
                ACTION_PREV -> sendBroadcast(Intent(ACTION_PREV))
                ACTION_UPDATE_METADATA -> {
                    val title = it.getStringExtra(EXTRA_TITLE) ?: "Apple Music"
                    val artist = it.getStringExtra(EXTRA_ARTIST) ?: "Streaming"
                    val album = it.getStringExtra(EXTRA_ALBUM) ?: "Apple Music"
                    val isPlaying = it.getBooleanExtra(EXTRA_IS_PLAYING, true)

                    val metadata = MediaMetadata.Builder()
                        .setTitle(title)
                        .setArtist(artist)
                        .setAlbumTitle(album)
                        .build()

                    val mediaItem = MediaItem.Builder().setMediaMetadata(metadata).build()
                    player.setMediaItem(mediaItem)
                    if (isPlaying) player.play() else player.pause()
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
}`,

    themes: `<!-- res/values/themes.xml -->
<!-- FIXES THE TOP BLUE BAR: Using NoActionBar eliminates the native header bar entirely -->
<resources>
    <style name="Theme.PureFullscreen" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <!-- Make status bar and nav bar 100% transparent for edge-to-edge content -->
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowDrawsSystemBarBackgrounds">true</item>
        <item name="android:windowLightStatusBar">true</item>
        <item name="android:windowBackground">#0a0a0c</item>
    </style>
</resources>`,

    mainActivity: `// app/src/main/java/com/applemusic/snappy/MainActivity.kt
package com.applemusic.snappy

import android.annotation.SuppressLint
import android.content.*
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    private val mediaReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                PlaybackMediaSessionService.ACTION_PLAY -> {
                    webView.evaluateJavascript("const a = document.querySelector('audio, video'); if (a) a.play();", null)
                }
                PlaybackMediaSessionService.ACTION_PAUSE -> {
                    webView.evaluateJavascript("const a = document.querySelector('audio, video'); if (a) a.pause();", null)
                }
            }
        }
    }

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

        // 1. NO BLUE BAR & EDGE-TO-EDGE
        supportActionBar?.hide()
        WindowCompat.setDecorFitsSystemWindows(window, false)

        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webView)
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        // 2. HIGH CACHE ENGINE
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
            mediaPlaybackRequiresUserGesture = false
            useWideViewPort = true
            loadWithOverviewMode = true
        }

        webView.addJavascriptInterface(WebAppInterface(this), "AndroidMediaBridge")

        // 3. START MEDIA SESSION SERVICE FOR BACKGROUND PLAYBACK
        val serviceIntent = Intent(this, PlaybackMediaSessionService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }

        webView.loadUrl("https://music.apple.com")
    }

    // =========================================================================
    // BACKGROUND PLAYBACK LIFECYCLE:
    // DO NOT call webView.onPause() or webView.pauseTimers()!
    // Keeping WebView active and running inside the Foreground Service
    // ensures audio continues playing when minimized or when the screen is locked.
    // =========================================================================
    override fun onPause() {
        super.onPause()
        // Do NOT pause WebView audio or timers
    }

    override fun onStop() {
        super.onStop()
        // Keep active for background playback
    }

    override fun onDestroy() {
        unregisterReceiver(mediaReceiver)
        stopService(Intent(this, PlaybackMediaSessionService::class.java))
        webView.destroy()
        super.onDestroy()
    }
}`,

    manifest: `<!-- AndroidManifest.xml -->
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions required for streaming, cache, and background playback -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:largeHeap="true"
        android:theme="@style/Theme.PureFullscreen">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:hardwareAccelerated="true"
            android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Modern MediaSessionService for Background Audio & Lock Screen Controls -->
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
</manifest>`,

    githubAction: `# .github/workflows/build-apk.yml
# Compiles your finished APK for free in GitHub Cloud (Takes ~60s)
name: Build Android APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Build APK
        run: gradle assembleDebug
      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: Finished_Apple_Music.apk
          path: app/build/outputs/apk/debug/app-debug.apk`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Android Source Code Reference</h3>
              <p className="text-xs text-zinc-400">
                Exact code snippets to remove the blue bar and maximize cache
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-900/30 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setSelectedFile('service')}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap ${
              selectedFile === 'service'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            MediaPlaybackService.kt (Background & Lock Screen)
          </button>
          <button
            onClick={() => setSelectedFile('themes')}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap ${
              selectedFile === 'themes'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            themes.xml (Remove Blue Bar)
          </button>
          <button
            onClick={() => setSelectedFile('mainActivity')}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap ${
              selectedFile === 'mainActivity'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            MainActivity.kt (Edge-to-Edge & Cache)
          </button>
          <button
            onClick={() => setSelectedFile('manifest')}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap ${
              selectedFile === 'manifest'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            AndroidManifest.xml
          </button>
          <button
            onClick={() => setSelectedFile('githubAction')}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap ${
              selectedFile === 'githubAction'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            GitHub Cloud APK Workflow
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          <div className="relative">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition text-xs border border-zinc-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <pre className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 overflow-x-auto leading-relaxed">
              {codeSnippets[selectedFile]}
            </pre>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Drop these files into Android Studio or use the ZIP generator.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
