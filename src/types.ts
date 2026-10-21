export interface ApkConfig {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  targetUrl: string;
  cacheMode: 'LOAD_DEFAULT' | 'LOAD_CACHE_ELSE_NETWORK' | 'AGGRESSIVE_TURBO';
  cacheSizeMb: number;
  enableHardwareAcceleration: boolean;
  enableDomStorage: boolean;
  enableDatabase: boolean;
  enableLargeHeap: boolean;
  hideActionBar: boolean;
  edgeToEdge: boolean;
  transparentStatusBar: boolean;
  keepScreenOn: boolean;
  allowMediaAutoplay: boolean;
  enableBackgroundPlayback: boolean;
  enableLockscreenControls: boolean;
  enableForegroundNotification: boolean;
  customUserAgent: string;
}

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl?: string;
  duration: number; // in seconds
  cached: boolean;
  cacheSizeKb: number;
  lyrics: Array<{ time: number; text: string }>;
  accentColor: string;
}

export interface CacheMetric {
  id: string;
  url: string;
  type: 'image' | 'audio' | 'script' | 'font' | 'html';
  sizeBytes: number;
  cachedAt: number;
  latencyMs: number;
  cachedLatencyMs: number;
}

export type ViewMode = 'simulator' | 'cover-only' | 'apk-builder' | 'cache-engine' | 'code-export';
