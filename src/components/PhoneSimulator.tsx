import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Wifi,
  Battery,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Globe,
  Radio,
  Music,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  Download,
  Lock,
  Unlock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BellRing,
  Volume2,
  ShieldCheck,
  Disc
} from 'lucide-react';
import { TrackItem } from '../types';
import { CoverOnlyView } from './CoverOnlyView';

interface PhoneSimulatorProps {
  currentTrack: TrackItem;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onCacheTrack: (track: TrackItem) => void;
  onOpenApkBuilder: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onCacheTrack,
  onOpenApkBuilder,
}) => {
  const [showBuggyBar, setShowBuggyBar] = useState(false);
  const [phoneViewMode, setPhoneViewMode] = useState<'cover-only' | 'apple-music-web' | 'lock-screen'>('cover-only');
  const [targetUrl, setTargetUrl] = useState('https://music.apple.com');

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
      {/* Phone Mockup Frame */}
      <div className="relative">
        {/* Glow halo around phone */}
        <div
          className="absolute -inset-4 rounded-[55px] opacity-30 blur-2xl transition duration-500 pointer-events-none"
          style={{
            background: showBuggyBar
              ? 'radial-gradient(circle, #3b82f6 0%, transparent 70%)'
              : phoneViewMode === 'lock-screen'
              ? 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)'
              : `radial-gradient(circle, ${currentTrack.accentColor} 0%, transparent 70%)`
          }}
        />

        {/* Physical Phone Chassis */}
        <div className="relative w-[360px] sm:w-[390px] h-[780px] bg-zinc-950 rounded-[48px] p-3 shadow-2xl border-[6px] border-zinc-800 ring-1 ring-white/10 flex flex-col overflow-hidden">
          {/* Hardware buttons simulation */}
          <div className="absolute -left-[9px] top-28 w-[3px] h-12 bg-zinc-700 rounded-l-md" />
          <div className="absolute -left-[9px] top-44 w-[3px] h-12 bg-zinc-700 rounded-l-md" />
          <div className="absolute -right-[9px] top-32 w-[3px] h-16 bg-zinc-700 rounded-r-md" />

          {/* Phone Inner Display Screen */}
          <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-black flex flex-col">
            {/* Native Android Status Bar */}
            <div
              className={`relative z-30 px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold transition-colors duration-300 ${
                showBuggyBar ? 'bg-[#1976D2] text-white' : 'bg-transparent text-white'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] tracking-tight">9:41</span>
                {!showBuggyBar && (
                  <span className="text-[10px] px-1 rounded bg-white/20 text-emerald-300 font-mono">
                    120Hz
                  </span>
                )}
              </div>

              {/* Dynamic Island / Camera cutout */}
              <div className="w-20 h-4 bg-black rounded-full border border-zinc-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-700" />
              </div>

              <div className="flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* BUGGY BLUE ACTIONBAR (The exact defect reported by the user) */}
            {showBuggyBar && phoneViewMode !== 'lock-screen' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: '56px' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative z-20 bg-[#2196F3] text-white px-4 flex items-center justify-between shadow-md border-b border-blue-400"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex flex-col justify-center gap-1">
                    <span className="w-5 h-0.5 bg-white" />
                    <span className="w-5 h-0.5 bg-white" />
                    <span className="w-5 h-0.5 bg-white" />
                  </div>
                  <span className="font-medium text-base tracking-wide">Apple Music APK</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] bg-red-600/80 px-2 py-0.5 rounded text-white font-mono animate-pulse">
                  Defect: Blue Bar
                </div>
              </motion.div>
            )}

            {/* Content Area */}
            <div className="relative flex-1 w-full overflow-hidden flex flex-col">
              {phoneViewMode === 'cover-only' && (
                /* Pure Cover-Only Content View */
                <CoverOnlyView
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onTogglePlay={onTogglePlay}
                  onNext={onNext}
                  onPrev={onPrev}
                  onCacheTrack={onCacheTrack}
                />
              )}

              {phoneViewMode === 'apple-music-web' && (
                /* Apple Music Web Simulation */
                <div className="relative w-full h-full bg-[#111] flex flex-col text-white overflow-y-auto">
                  {/* Apple Music banner header */}
                  <div className="p-4 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5" />
                      <span className="font-bold tracking-tight text-sm">Apple Music Web</span>
                    </div>
                    <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full">
                      Snappy Edge-to-Edge
                    </span>
                  </div>

                  {/* Feed mock content */}
                  <div className="p-4 flex flex-col gap-4">
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-zinc-800">
                      <img
                        src={currentTrack.coverUrl}
                        alt="Featured"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
                          Now Playing
                        </span>
                        <h4 className="text-lg font-bold">{currentTrack.title}</h4>
                        <p className="text-xs text-zinc-300">{currentTrack.artist}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Quick Listen (Instant Cached)
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          onClick={onTogglePlay}
                          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 transition"
                        >
                          <img
                            src={currentTrack.coverUrl}
                            className="w-10 h-10 rounded-lg object-cover"
                            alt="thumb"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold truncate">{currentTrack.title}</p>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" /> 0ms Hit
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 transition">
                          <div className="w-10 h-10 rounded-lg bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-pink-400">
                            <Radio className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold">Hits 1 Radio</p>
                            <span className="text-[10px] text-zinc-400">Live Stream</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cache & Background Playback status banner */}
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="font-semibold text-zinc-200">Background Playback Ready</p>
                          <p className="text-[10px] text-zinc-400">Service + WakeLock active</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {phoneViewMode === 'lock-screen' && (
                /* ANDROID LOCK SCREEN SIMULATION WITH RICH MEDIA CONTROLS */
                <div className="relative w-full h-full bg-black/95 flex flex-col justify-between p-5 text-white overflow-hidden">
                  {/* Dynamic background wallpaper taking album art with heavy blur */}
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-125 opacity-30 pointer-events-none transition-all duration-700"
                    style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
                  />

                  {/* Lock Screen Header Clock */}
                  <div className="relative z-10 flex flex-col items-center pt-8">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium mb-1">
                      <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Phone Locked (Screen Off / Background)</span>
                    </div>
                    <span className="text-5xl font-extralight tracking-tight text-white font-sans">
                      09:41
                    </span>
                    <span className="text-xs font-medium text-zinc-300 mt-1">
                      Tuesday, October 21
                    </span>
                  </div>

                  {/* ANDROID MEDIA NOTIFICATION (MediaStyle & Lock Screen Visibility) */}
                  <div className="relative z-10 my-auto">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full rounded-3xl bg-zinc-900/85 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl flex flex-col gap-3"
                    >
                      {/* Notification Subheader */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
                            <Music className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="font-semibold text-zinc-200">Apple Music</span>
                          <span>•</span>
                          <span className="text-emerald-400 flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Foreground Service
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400">Now</span>
                      </div>

                      {/* Main track info & cover art */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-md border border-white/10">
                          <img
                            src={currentTrack.coverUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                          {isPlaying && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-sm text-white truncate">
                            {currentTrack.title}
                          </h4>
                          <p className="text-xs text-zinc-300 truncate mt-0.5">
                            {currentTrack.artist}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">
                            {currentTrack.album}
                          </p>
                        </div>
                      </div>

                      {/* Notification Media Transport Buttons (Lock Screen controls) */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={onPrev}
                          className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition active:scale-95"
                          title="Previous Track"
                        >
                          <SkipBack className="w-5 h-5 fill-current" />
                        </button>

                        <button
                          onClick={onTogglePlay}
                          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
                          title={isPlaying ? "Pause Background Playback" : "Resume Background Playback"}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current text-black" />
                          ) : (
                            <Play className="w-5 h-5 fill-current text-black translate-x-0.5" />
                          )}
                        </button>

                        <button
                          onClick={onNext}
                          className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition active:scale-95"
                          title="Next Track"
                        >
                          <SkipForward className="w-5 h-5 fill-current" />
                        </button>
                      </div>

                      {/* Mini progress bar in notification */}
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-500 rounded-full"
                          style={{ width: '42%' }}
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Lock Screen Bottom Swipe to Unlock */}
                  <div className="relative z-10 flex flex-col items-center pb-4">
                    <button
                      onClick={() => setPhoneViewMode('cover-only')}
                      className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Swipe or Tap to Unlock Phone</span>
                    </button>
                    <span className="text-[10px] text-zinc-400 mt-2 font-mono">
                      Background audio continues non-stop
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Android Navigation Bar (Transparent In Rewritten APK) */}
            <div className="relative z-20 py-2 flex items-center justify-center bg-transparent">
              <div className="w-32 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Control & Comparison Deck (Right side) */}
      <div className="flex-1 max-w-xl flex flex-col gap-5">
        {/* Background Playback & Lock Screen Verification Card */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">
                Background Playback & Lock Screen
              </h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
              Foreground Service Active
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Standard Android WebViews pause all audio immediately when minimized or when the screen locks.
            The rewritten APK registers a <strong>Foreground Media Service</strong>, acquires a <strong>CPU Partial WakeLock</strong>, and renders <strong>NotificationCompat.MediaStyle</strong> with full lock screen transport controls.
          </p>

          {/* Mode Selector within Phone Simulator */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Test Phone Screen & State
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPhoneViewMode('cover-only')}
                className={`py-3 px-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition ${
                  phoneViewMode === 'cover-only'
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Cover Only</span>
              </button>

              <button
                onClick={() => setPhoneViewMode('apple-music-web')}
                className={`py-3 px-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition ${
                  phoneViewMode === 'apple-music-web'
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Web Player</span>
              </button>

              <button
                onClick={() => setPhoneViewMode('lock-screen')}
                className={`py-3 px-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition ${
                  phoneViewMode === 'lock-screen'
                    ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white border-pink-400 shadow-lg'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Test Lock Screen</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Banner: The blue line defect inspector */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
              Visual APK Defect Inspector
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Simulate Blue Line:</span>
              <button
                onClick={() => setShowBuggyBar(!showBuggyBar)}
                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showBuggyBar ? 'bg-blue-600' : 'bg-emerald-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    showBuggyBar ? 'translate-x-0' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              showBuggyBar
                ? 'bg-blue-950/40 border-blue-600/50 text-blue-200'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {showBuggyBar ? (
                <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {showBuggyBar
                    ? 'Default Android App Defect (With Blue Bar)'
                    : 'SnappyEdge Rewritten APK (Edge-to-Edge Pure Content)'}
                </h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  {showBuggyBar
                    ? 'The blue bar at the top comes from the default Android ActionBar theme. It eats vertical space and breaks fullscreen cover mode.'
                    : 'The rewritten APK applies Theme.NoActionBar and WindowCompat edge-to-edge, seamlessly covering the notch and status bar area.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Speed & High-Cache Metrics Card */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-sm text-white">Aggressive Cache Engine</h4>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
              Snappy Speed Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 flex flex-col">
              <span className="text-[11px] text-zinc-400">Background Mode</span>
              <span className="text-sm font-bold text-emerald-400 mt-1">FOREGROUND</span>
              <span className="text-[10px] text-emerald-400 mt-0.5">Uninterrupted</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 flex flex-col">
              <span className="text-[11px] text-zinc-400">Load Latency</span>
              <span className="text-sm font-bold text-emerald-400 mt-1">0ms</span>
              <span className="text-[10px] text-zinc-400 mt-0.5 font-mono">Instant RAM</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 flex flex-col">
              <span className="text-[11px] text-zinc-400">Rendering Layer</span>
              <span className="text-sm font-bold text-white mt-1">Hardware GPU</span>
              <span className="text-[10px] text-purple-400 mt-0.5">120 FPS</span>
            </div>
          </div>

          {/* One-click Action to Build APK */}
          <div className="pt-2">
            <button
              onClick={onOpenApkBuilder}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Build & Download Finished APK Project (.zip)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
