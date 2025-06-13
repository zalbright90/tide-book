import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_FILE = path.join(__dirname, 'tideCache.json');

let cache = {};

// Load cache from file on startup
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    console.log('Cache loaded from disk');
  } catch (e) {
    console.error('Failed to load cache file, starting with empty cache');
    cache = {};
  }
}

export function getCache(key) {
  const cachedItem = cache[key];
  if (!cachedItem) return null;

  // Check TTL (24 hours)
  if ((Date.now() - cachedItem.timestamp) > 24 * 60 * 60 * 1000) {
    delete cache[key]; // Expired, remove
    return null;
  }
  return cachedItem.data;
}

export function setCache(key, data) {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
  // Save cache to disk async (can optimize with debounce/throttle later)
  fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), err => {
    if (err) console.error('Failed to save cache:', err);
  });
}