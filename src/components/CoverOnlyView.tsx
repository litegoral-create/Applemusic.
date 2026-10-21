import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Zap,
  AlignLeft,
  Disc3,
  HardDriveDownload,
  Share2,
  Radio,
  Music2
} from 'lucide-react';
import { TrackItem } from '../types';

interface CoverOnlyViewProps {
  currentTrack: TrackItem;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onCacheTrack: (track: TrackItem) => void;
}

export const CoverOnlyView: React.FC<CoverOnlyViewProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onCacheTrack,
}) => {
  const [progress, setProgress] = useState(38); // 38%
  const [currentTime, setCurrentTime] = useState(87); // 1:27
  const [showLyrics, setShowLyrics] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [vinylSpin, setVinylSpin] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= currentTrack.duration) {
            onNext();
            return 0;
          }
          setProgress((next / currentTrack.duration) * 100);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack, onNext]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Find active lyric line
  const activeLyricIndex = currentTrack.lyrics.reduce((acc, lyric, idx) => {
    return currentTime >= lyric.time ? idx : acc;
  }, 0);

  return (
    <div className="relative w-full h-full min-h-[620px] rounded-3xl overflow-hidden flex flex-col justify-between p-6 sm:p-8 select-none bg-black text-white">
      {/* Dynamic blurred background taking track accent colors */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-125 filter blur-3xl opacity-40 pointer-events-none"
        style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
      />

      {/* Dark gradient overlay for ultra-crisp contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90 pointer-events-none" />

      {/* Top Header - Edge-to-Edge Indicator (NO BLUE BAR) */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-200">Zero Blue Bar • Edge-to-Edge</span>
        </div>

        <div className="flex items-center gap-2">
          {currentTrack.cached ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Ultra Snappy Cache (0ms)</span>
            </div>
          ) : (
            <button
              onClick={() => onCacheTrack(currentTrack)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 border border-white/10 text-xs font-semibold transition"
            >
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span>Pre-Cache Track</span>
            </button>
          )}

          <button
            onClick={() => setShowLyrics(!showLyrics)}
            className={`p-2 rounded-full border transition ${
              showLyrics
                ? 'bg-white text-black border-white shadow-lg shadow-white/20'
                : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
            }`}
            title="Toggle Fullscreen Lyrics HUD"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: COVER-ONLY FOCUS (Dominates the screen) */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center py-4">
        <AnimatePresence mode="wait">
          {!showLyrics ? (
            <motion.div
              key="cover-mode"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* Album Art with Ambient Glow & Floating 3D Depth */}
              <div className="relative group cursor-pointer" onClick={() => setVinylSpin(!vinylSpin)}>
                {/* Dynamic colored glow ring behind cover */}
                <div
                  className="absolute -inset-4 rounded-3xl opacity-75 blur-2xl transition duration-700 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle, ${currentTrack.accentColor} 0%, transparent 70%)`
                  }}
                />

                {/* Primary High-Resolution Cover Art */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isPlaying ? 'scale-105' : 'scale-100'
                    }`}
                  />

                  {/* High fidelity tag */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-wider font-bold text-white/90 border border-white/10">
                    Lossless 24-Bit / 192kHz
                  </div>

                  {/* Snappy indicator badge */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-semibold text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Instant Hit</span>
                  </div>
                </div>
              </div>

              {/* Title & Artist with Apple-style typography */}
              <div className="mt-6 text-center max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md">
                  {currentTrack.title}
                </h2>
                <p className="text-sm sm:text-base font-medium text-zinc-300 mt-1">
                  {currentTrack.artist}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{currentTrack.album}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="lyrics-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg h-80 overflow-y-auto px-4 flex flex-col gap-4 py-8 scrollbar-none text-left"
            >
              {currentTrack.lyrics.map((lyric, idx) => {
                const isActive = idx === activeLyricIndex;
                return (
                  <div
                    key={idx}
                    className={`transition-all duration-300 text-lg sm:text-xl font-bold cursor-pointer ${
                      isActive
                        ? 'text-white scale-105 origin-left drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    onClick={() => {
                      setCurrentTime(lyric.time);
                      setProgress((lyric.time / currentTrack.duration) * 100);
                    }}
                  >
                    {lyric.text}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls - Edge-to-Edge Clean Player HUD */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col gap-3">
        {/* Scrubber Progress Bar */}
        <div className="flex flex-col gap-1">
          <div
            className="w-full h-1.5 bg-white/20 hover:h-2 rounded-full overflow-hidden cursor-pointer transition-all"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              const newTime = ratio * currentTrack.duration;
              setCurrentTime(newTime);
              setProgress(ratio * 100);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full relative transition-all duration-150"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100" />
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-medium text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(currentTrack.duration - currentTime)}</span>
          </div>
        </div>

        {/* Buttons HUD */}
        <div className="flex items-center justify-between px-2">
          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Core Transport Buttons */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={onPrev}
              className="p-2 text-zinc-300 hover:text-white transition active:scale-95"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current text-black" />
              ) : (
                <Play className="w-6 h-6 fill-current text-black translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 text-zinc-300 hover:text-white transition active:scale-95"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          {/* Fullscreen icon */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
            title="True Edge-to-Edge Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
