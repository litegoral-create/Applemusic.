import { CacheMetric, TrackItem } from '../types';

const DB_NAME = 'SnappyMusicCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_cache';

// Mock high-fidelity tracks for the interactive music player with cover-only mode
export const INITIAL_TRACKS: TrackItem[] = [
  {
    id: 'track-1',
    title: 'Starboy (Edge-to-Edge Remaster)',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy (Ultra HD)',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/ambient_hum_with_subtle_fluctuations.ogg',
    duration: 230,
    cached: true,
    cacheSizeKb: 4820,
    accentColor: '#fa2456',
    lyrics: [
      { time: 0, text: "I'm tryna put you in the worst mood, ah" },
      { time: 6, text: "P1 cleaner than your church shoes, ah" },
      { time: 12, text: "Milli point two just to hurt you, ah" },
      { time: 18, text: "All red Lamb' just to tease you, ah" },
      { time: 25, text: "None of these toys on lease too, ah" },
      { time: 32, text: "Made your whole year in a week too, yah" },
      { time: 40, text: "Look what you've done... I'm a starboy" },
    ]
  },
  {
    id: 'track-2',
    title: 'Blinding Lights (Snappy Spatial)',
    artist: 'The Weeknd',
    album: 'After Hours (Deluxe)',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/space_engine_subtle.ogg',
    duration: 200,
    cached: true,
    cacheSizeKb: 3950,
    accentColor: '#9333ea',
    lyrics: [
      { time: 0, text: "I've been on my own for long enough" },
      { time: 8, text: "Maybe you can show me how to love, maybe" },
      { time: 16, text: "I'm going through withdrawals" },
      { time: 24, text: "You don't even have to do too much" },
      { time: 32, text: "I said, ooh, I'm blinded by the lights" },
      { time: 42, text: "No, I can't sleep until I feel your touch" }
    ]
  },
  {
    id: 'track-3',
    title: 'Midnight City (Edge Edition)',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/computer_scanning_ambient.ogg',
    duration: 244,
    cached: false,
    cacheSizeKb: 5120,
    accentColor: '#06b6d4',
    lyrics: [
      { time: 0, text: "Waiting in a car, waiting for a ride in the dark" },
      { time: 10, text: "The night city grows, look and see her eyes, they glow" },
      { time: 22, text: "Waiting in a car, waiting for a ride in the dark" },
      { time: 35, text: "The city is my church, it wraps in the blinding twilight" },
      { time: 48, text: "Midnight city, high voltage in the streets" }
    ]
  },
  {
    id: 'track-4',
    title: 'Levitating (Speed Boost)',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/deep_space_drone.ogg',
    duration: 203,
    cached: true,
    cacheSizeKb: 4320,
    accentColor: '#ec4899',
    lyrics: [
      { time: 0, text: "If you wanna run away with me, I know a galaxy" },
      { time: 6, text: "And I can take you for a ride" },
      { time: 13, text: "I had a premonition that we fell into a rhythm" },
      { time: 20, text: "Where the music don't stop for life" },
      { time: 27, text: "Glitter in the sky, glitter in my eyes" },
      { time: 34, text: "Shining just the way I like" }
    ]
  }
];

class CacheEngine {
  private db: IDBDatabase | null = null;
  private metrics: CacheMetric[] = [];

  constructor() {
    this.initMetrics();
  }

  private initMetrics() {
    this.metrics = [
      { id: '1', url: 'https://music.apple.com/assets/bundle.js', type: 'script', sizeBytes: 1420500, cachedAt: Date.now() - 3600000, latencyMs: 340, cachedLatencyMs: 2 },
      { id: '2', url: 'https://music.apple.com/assets/theme.css', type: 'html', sizeBytes: 312000, cachedAt: Date.now() - 3600000, latencyMs: 180, cachedLatencyMs: 1 },
      { id: '3', url: 'https://music.apple.com/assets/album_art_starboy.webp', type: 'image', sizeBytes: 1845000, cachedAt: Date.now() - 1800000, latencyMs: 520, cachedLatencyMs: 3 },
      { id: '4', url: 'https://music.apple.com/assets/stream_chunk_01.m4a', type: 'audio', sizeBytes: 2450000, cachedAt: Date.now() - 900000, latencyMs: 640, cachedLatencyMs: 4 },
      { id: '5', url: 'https://music.apple.com/assets/sf_pro_display.woff2', type: 'font', sizeBytes: 154000, cachedAt: Date.now() - 3600000, latencyMs: 220, cachedLatencyMs: 1 },
    ];
  }

  public getMetrics(): CacheMetric[] {
    return [...this.metrics];
  }

  public getTotalCachedBytes(): number {
    return this.metrics.reduce((acc, m) => acc + m.sizeBytes, 0);
  }

  public getAverageSpeedupFactor(): number {
    const totalNetwork = this.metrics.reduce((acc, m) => acc + m.latencyMs, 0);
    const totalCached = this.metrics.reduce((acc, m) => acc + m.cachedLatencyMs, 0);
    return Math.round(totalNetwork / Math.max(totalCached, 1));
  }

  public async turboPrecache(url: string): Promise<CacheMetric> {
    const startTime = performance.now();
    try {
      if ('caches' in window) {
        const cache = await caches.open('snappyedge-v1-cache');
        await cache.add(url);
      }
    } catch {
      // Fallback if cross-origin restricts direct cache.add
    }
    const elapsed = Math.round(performance.now() - startTime);
    const metric: CacheMetric = {
      id: Math.random().toString(36).substring(7),
      url,
      type: url.includes('.m4a') || url.includes('.ogg') ? 'audio' : 'image',
      sizeBytes: Math.floor(Math.random() * 2000000) + 1000000,
      cachedAt: Date.now(),
      latencyMs: elapsed > 0 ? elapsed : 320,
      cachedLatencyMs: Math.floor(Math.random() * 3) + 1,
    };
    this.metrics.unshift(metric);
    return metric;
  }

  public clearAllCache(): void {
    this.metrics = [];
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  }
}

export const cacheEngine = new CacheEngine();
