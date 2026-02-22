// src/services/cache.service.js

let libraryCache = null;
let cacheTimestamp = null;
const TTL = 1000 * 60 * 5; // 5 minutos

export const getCache = () => {
  if (!libraryCache) return null;
  if (Date.now() - cacheTimestamp > TTL) {
    libraryCache = null;
    return null;
  }
  return libraryCache;
};

export const setCache = (data) => {
  libraryCache = data;
  cacheTimestamp = Date.now();
};

export const invalidateCache = () => {
  libraryCache = null;
};
