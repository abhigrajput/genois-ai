const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

export const cachedQuery = async (key, queryFn) => {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  const data = await queryFn();
  cache.set(key, { data, timestamp: now });
  return data;
};

export const clearCache = (key) => {
  if (key) cache.delete(key);
  else cache.clear();
};
