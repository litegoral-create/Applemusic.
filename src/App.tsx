/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  Zap,
  Download,
  FileCode,
  Sparkles,
  Music2,
  CheckCircle2,
  Maximize2,
  Layers,
  Radio,
  ExternalLink,
  Shield,
  HelpCircle,
  Play,
  Pause
} from 'lucide-react';
import { TrackItem } from './types';
import { INITIAL_TRACKS, cacheEngine } from './utils/cacheEngine';
import { PhoneSimulator } from './components/PhoneSimulator';
import { CoverOnlyView } from './components/CoverOnlyView';
import { ApkBuilderModal } from './components/ApkBuilderModal';
import { CacheManagerModal } from './components/CacheManagerModal';
import { CodeExportModal } from './components/CodeExportModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  const [tracks, setTracks] = useState<TrackItem[]>(INITIAL_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mainView, setMainView] = useState<'simulator' | 'standalone-cover' | 'apk-guide'>('simulator');

  // Modals state
  const [showApkBuilder, setShowApkBuilder] = useState(false);
  const [showCacheManager, setShowCacheManager] = useState(false);
  const [showCodeExport, setShowCodeExport] = useState(false);

  // Hidden audio element for realistic playback
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Autoplay policy or offline catch
        });
      } else {
        audioRef.current.pause();
      }
    }

    // Connect to real browser/system MediaSession (enables background lockscreen & notification controls)
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album,
          artwork: [
            { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '192x192', type: 'image/jpeg' },
          ],
        });

        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

        navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
        navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
        });
      } catch (e) {
        console.warn('MediaSession initialization error', e);
      }
    }
  }, [isPlaying, currentTrackIndex, currentTrack, tracks.length]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleCacheTrack = async (track: TrackItem) => {
    await cacheEngine.turboPrecache(track.coverUrl);
    if (track.audioUrl) {
      await cacheEngine.turboPrecache(track.audioUrl);
    }
    setTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, cached: true } : t))
    );
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Real audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        loop
        preload="auto"
      />

      {/* In-App PWA Install Banner (Edge-to-Edge Android WebAPK) */}
      <PWAInstallBanner />

      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-pink-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-pink-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                SnappyEdge
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-bold uppercase tracking-wider">
                Full-Screen APK Studio
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Zero Blue Bar • Cover-Only Content • Maximum Cache Turbo Engine
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowCacheManager(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition"
            title="Inspect & Turbo-Boost Local Flash Cache"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Cache Turbo</span>
          </button>

          <button
            onClick={() => setShowCodeExport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition"
            title="View Kotlin & themes.xml code fix"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Inspect Code Fix</span>
          </button>

          <button
            onClick={() => setShowApkBuilder(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-pink-500/20 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Build Finished APK</span>
          </button>
        </div>
      </header>

      {/* Main Subheader Navigation Switcher */}
      <div className="w-full border-b border-zinc-900 bg-zinc-950/40 px-4 sm:px-8 py-2.5 flex items-center justify-between overflow-x-auto text-xs font-medium">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMainView('simulator')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              mainView === 'simulator'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Interactive Phone Simulator & Fix</span>
          </button>

          <button
            onClick={() => setMainView('standalone-cover')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              mainView === 'standalone-cover'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cover-Only View (Standalone)</span>
          </button>

          <button
            onClick={() => setMainView('apk-guide')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              mainView === 'apk-guide'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>APK Build Guide & Methods</span>
          </button>
        </div>

        {/* Quick Track Switcher Pill */}
        <div className="flex items-center gap-2 pl-4">
          <span className="text-[11px] text-zinc-500 hidden lg:inline">Quick Track:</span>
          <div className="flex items-center gap-1">
            {tracks.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setCurrentTrackIndex(idx)}
                className={`w-7 h-7 rounded-lg overflow-hidden border transition ${
                  idx === currentTrackIndex
                    ? 'border-pink-500 ring-2 ring-pink-500/40'
                    : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
                title={`${t.title} - ${t.artist}`}
              >
                <img src={t.coverUrl} alt={t.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {mainView === 'simulator' && (
          <PhoneSimulator
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onNext={handleNext}
            onPrev={handlePrev}
            onCacheTrack={handleCacheTrack}
            onOpenApkBuilder={() => setShowApkBuilder(true)}
          />
        )}

        {mainView === 'standalone-cover' && (
          <div className="w-full max-w-4xl mx-auto my-auto py-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">
                  Cover-Only Fullscreen Experience
                </h3>
                <p className="text-xs text-zinc-400">
                  Rewritten without navigation headers or blue borders, focused 100% on high-res artwork & audio.
                </p>
              </div>
              <button
                onClick={() => setMainView('simulator')}
                className="text-xs text-pink-400 hover:text-pink-300 font-semibold"
              >
                Back to Phone Frame →
              </button>
            </div>

            <div className="h-[680px] w-full rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
              <CoverOnlyView
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onNext={handleNext}
                onPrev={handlePrev}
                onCacheTrack={handleCacheTrack}
              />
            </div>
          </div>
        )}

        {mainView === 'apk-guide' && (
          <div className="w-full max-w-4xl mx-auto space-y-6 py-4">
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-3">
              <h2 className="text-xl font-extrabold text-white">
                How Your Finished APK Is Fixed & Delivered
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                When wrapping web apps (like Apple Music) in an Android APK, two common bottlenecks occur:
                the top <strong>blue ActionBar</strong> artifact and sluggish, laggy loading from insufficient caching.
                Here is exactly how both issues are permanently solved:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Solution 1 */}
              <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-bold text-base text-white">
                  Eliminating the Top Blue Line
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Default Android themes inject a blue native header. By applying <code className="text-blue-400 font-mono">Theme.MaterialComponents.DayNight.NoActionBar</code> and calling <code className="text-blue-400 font-mono">WindowCompat.setDecorFitsSystemWindows(window, false)</code>, the app renders directly behind the status bar in true edge-to-edge mode.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowCodeExport(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <span>View styles.xml & MainActivity.kt code</span> →
                  </button>
                </div>
              </div>

              {/* Solution 2 */}
              <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="font-bold text-base text-white">
                  Increasing Caches for Snappy Speed
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Standard WebViews only keep a few megabytes in memory. The rewritten APK allocates a 500MB+ dedicated flash cache directory, sets <code className="text-amber-400 font-mono">LOAD_CACHE_ELSE_NETWORK</code>, enables DOM/IndexedDB storage, and turns on GPU hardware layer acceleration.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowCacheManager(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <span>Test Cache Speed Benchmark</span> →
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Quick compilation options */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-black border border-zinc-800 space-y-4">
              <h3 className="font-bold text-base text-white">
                3 Ways to Get Your Finished APK File Right Now:
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-pink-300">
                      Option A: 1-Click ZIP Download (Android Studio Ready)
                    </p>
                    <p className="text-xs text-zinc-400">
                      Click below to generate the complete Android Studio project with preconfigured Gradle and Kotlin files.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowApkBuilder(true)}
                    className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shrink-0 transition"
                  >
                    Export Project (.zip)
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-amber-300">
                      Option B: Instant GitHub Cloud Build (0 Software Needed)
                    </p>
                    <p className="text-xs text-zinc-400">
                      Push the exported project to GitHub. The included workflow automatically compiles and outputs your .apk binary.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowApkBuilder(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs shrink-0 transition"
                  >
                    View Workflow
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-blue-300">
                      Option C: Direct WebAPK on Android Phone
                    </p>
                    <p className="text-xs text-zinc-400">
                      Open this URL in Google Chrome on your Android phone and tap "Install App". Android builds a native WebAPK with 0 blue bar!
                    </p>
                  </div>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shrink-0 flex items-center gap-1.5 transition"
                  >
                    <span>PWABuilder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950 px-6 py-4 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          SnappyEdge Engine • Eliminates Android native ActionBar defects & optimizes flash caching.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCodeExport(true)}
            className="hover:text-zinc-300 transition"
          >
            Code Fixes
          </button>
          <button
            onClick={() => setShowApkBuilder(true)}
            className="hover:text-zinc-300 transition"
          >
            APK Builder
          </button>
          <button
            onClick={() => setShowCacheManager(true)}
            className="hover:text-zinc-300 transition"
          >
            Cache Benchmarks
          </button>
        </div>
      </footer>

      {/* Modals */}
      <ApkBuilderModal
        isOpen={showApkBuilder}
        onClose={() => setShowApkBuilder(false)}
      />

      <CacheManagerModal
        isOpen={showCacheManager}
        onClose={() => setShowCacheManager(false)}
        tracks={tracks}
        onRefreshTracks={() => setTracks([...tracks])}
      />

      <CodeExportModal
        isOpen={showCodeExport}
        onClose={() => setShowCodeExport(false)}
      />
    </div>
  );
}
