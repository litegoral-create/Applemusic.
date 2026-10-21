import React, { useState } from 'react';
import {
  X,
  Download,
  Settings,
  Sparkles,
  Check,
  CheckCircle2,
  FileCode,
  Github,
  Terminal,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { ApkConfig } from '../types';
import { generateAndroidProjectZip } from '../utils/apkGenerator';

interface ApkBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkBuilderModal: React.FC<ApkBuilderModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ApkConfig>({
    appName: 'Apple Music Fullscreen',
    packageName: 'com.applemusic.snappy',
    versionName: '1.0.0',
    versionCode: 1,
    targetUrl: 'https://music.apple.com',
    cacheMode: 'AGGRESSIVE_TURBO',
    cacheSizeMb: 500,
    enableHardwareAcceleration: true,
    enableDomStorage: true,
    enableDatabase: true,
    enableLargeHeap: true,
    hideActionBar: true,
    edgeToEdge: true,
    transparentStatusBar: true,
    keepScreenOn: true,
    allowMediaAutoplay: true,
    enableBackgroundPlayback: true,
    enableLockscreenControls: true,
    enableForegroundNotification: true,
    customUserAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'cloud-build' | 'install-options'>('config');

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);
    try {
      const blob = await generateAndroidProjectZip(config);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.appName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Android_Source.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Failed to generate project zip', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Finished APK & Source Builder</h3>
              <p className="text-xs text-zinc-400">
                Rewritten with Zero Blue Bar, Edge-to-Edge Cover & Maximum Cache
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-900/30 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'config'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            APK Configuration & Fixes
          </button>
          <button
            onClick={() => setActiveTab('cloud-build')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'cloud-build'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Instant Cloud APK Build (0 Setup)
          </button>
          <button
            onClick={() => setActiveTab('install-options')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'install-options'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Direct WebAPK on Phone
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* Highlight card for the blue line & cache fix */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-200">
                  <p className="font-bold text-sm text-emerald-300">
                    Fix Applied: Top Blue Bar Removed + High Cache Enabled
                  </p>
                  <p className="mt-1 leading-relaxed text-zinc-300">
                    The exported project automatically uses <code className="text-emerald-400 font-mono">Theme.MaterialComponents.DayNight.NoActionBar</code> to eradicate the blue header bar. It also activates <code className="text-emerald-400 font-mono">LOAD_CACHE_ELSE_NETWORK</code> and <code className="text-emerald-400 font-mono">largeHeap="true"</code> for 60/120 FPS snappy performance.
                  </p>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Application Name</label>
                  <input
                    type="text"
                    value={config.appName}
                    onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Android Package ID</label>
                  <input
                    type="text"
                    value={config.packageName}
                    onChange={(e) => setConfig({ ...config, packageName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Target Web URL (Music Stream)</label>
                  <input
                    type="text"
                    value={config.targetUrl}
                    onChange={(e) => setConfig({ ...config, targetUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Cache & Performance Options */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Speed & High-Cache Engine Tuning
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-200">Flash Cache Size Pool</p>
                      <p className="text-[11px] text-zinc-400">Local disk cache for artwork & songs</p>
                    </div>
                    <select
                      value={config.cacheSizeMb}
                      onChange={(e) => setConfig({ ...config, cacheSizeMb: Number(e.target.value) })}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white font-mono text-xs border border-zinc-700"
                    >
                      <option value="250">250 MB</option>
                      <option value="500">500 MB (Recommended)</option>
                      <option value="1024">1 GB (Heavy Cache)</option>
                      <option value="2048">2 GB (Max Snappy)</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-200">Hardware Acceleration</p>
                      <p className="text-[11px] text-zinc-400">GPU rendering layer for 120 FPS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableHardwareAcceleration}
                      onChange={(e) =>
                        setConfig({ ...config, enableHardwareAcceleration: e.target.checked })
                      }
                      className="w-5 h-5 rounded accent-pink-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-200">Android largeHeap</p>
                      <p className="text-[11px] text-zinc-400">Prevents memory lag with heavy covers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableLargeHeap}
                      onChange={(e) => setConfig({ ...config, enableLargeHeap: e.target.checked })}
                      className="w-5 h-5 rounded accent-pink-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-200">True Edge-to-Edge Window</p>
                      <p className="text-[11px] text-zinc-400">Transparent system bars (No letterbox)</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.edgeToEdge}
                      onChange={(e) => setConfig({ ...config, edgeToEdge: e.target.checked })}
                      className="w-5 h-5 rounded accent-pink-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Background Playback & Lock Screen Controls */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Background Audio & Lock Screen Media Controls
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-200">Background Playback Service</p>
                      <p className="text-[11px] text-zinc-400">Plays when minimized or screen locked</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableBackgroundPlayback}
                      onChange={(e) =>
                        setConfig({ ...config, enableBackgroundPlayback: e.target.checked })
                      }
                      className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-200">Lock Screen Transport Controls</p>
                      <p className="text-[11px] text-zinc-400">Media notification with Play/Skip</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableLockscreenControls}
                      onChange={(e) =>
                        setConfig({ ...config, enableLockscreenControls: e.target.checked })
                      }
                      className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cloud-build' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-pink-400 font-bold">
                  <Github className="w-5 h-5" />
                  <span>How to compile the APK with 0 software installed:</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-300 leading-relaxed">
                  <li>
                    Download the project ZIP below by clicking <strong>"Download Finished Project (.zip)"</strong>.
                  </li>
                  <li>
                    Create a free new GitHub repository (e.g. <code className="font-mono text-pink-300">snappy-music-apk</code>).
                  </li>
                  <li>
                    Drag and drop the unzipped files into your repository.
                  </li>
                  <li>
                    GitHub Actions will <strong>automatically trigger</strong> the included <code className="font-mono text-emerald-300">.github/workflows/build-apk.yml</code> workflow!
                  </li>
                  <li>
                    Under the <strong>Actions</strong> tab, click the completed build and download your compiled, signed <strong>.apk</strong> directly to your phone!
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 font-mono text-xs text-zinc-300 space-y-2">
                <p className="text-zinc-500">// Or build locally with 1 terminal command:</p>
                <div className="p-2.5 rounded-xl bg-zinc-900 text-pink-300 flex items-center justify-between">
                  <span>./gradlew assembleDebug</span>
                  <span className="text-[10px] text-zinc-500">Outputs app-debug.apk</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'install-options' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-purple-950/40 border border-blue-500/30 space-y-3">
                <h4 className="font-bold text-base text-blue-200">
                  Instant WebAPK Feature (Built into Android Chrome)
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Android includes an engine that converts compliant PWAs into official Android <strong>WebAPKs</strong> directly on your phone:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300">
                  <li>No top blue bar (renders edge-to-edge standalone)</li>
                  <li>Faster than traditional WebViews (utilizes Chrome V8 JIT & disk caching)</li>
                  <li>Appears on your phone’s App Drawer with a native icon</li>
                </ul>

                <div className="pt-2">
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition"
                  >
                    <span>Open PWABuilder (Instant APK generator)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div>
            {downloadSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Ready-to-build Android source project downloaded!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition"
            >
              Close
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Packaging Project...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Finished Project (.zip)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
