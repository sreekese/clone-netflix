const cache = new Map();
const pending = new Map();
const MAX_ENTRIES = 100;
const TTL = 5 * 60 * 1000;
const abortError = () => new DOMException('Request cancelled', 'AbortError');

/** Share requests while allowing each consumer to cancel independently. */
export function cachedRequest(key, loader, signal) {
  if (signal?.aborted) return Promise.reject(abortError());
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now())
    return Promise.resolve(cached.data);
  cache.delete(key);
  let entry = pending.get(key);
  if (!entry) {
    const controller = new AbortController();
    entry = { controller, users: 0 };
    entry.promise = loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          if (cache.size >= MAX_ENTRIES)
            cache.delete(cache.keys().next().value);
          cache.set(key, { data, expires: Date.now() + TTL });
        }
        return data;
      })
      .finally(() => {
        if (pending.get(key) === entry) pending.delete(key);
      });
    pending.set(key, entry);
  }
  entry.users++;
  return new Promise((resolve, reject) => {
    let finished = false;
    function release() {
      if (finished) return false;
      finished = true;
      signal?.removeEventListener('abort', cancel);
      entry.users--;
      if (entry.users === 0) {
        entry.controller.abort();
        if (pending.get(key) === entry) pending.delete(key);
      }
      return true;
    }
    function cancel() {
      if (release()) reject(abortError());
    }
    signal?.addEventListener('abort', cancel, { once: true });
    entry.promise.then(
      (data) => {
        if (release()) resolve(data);
      },
      (error) => {
        if (release()) reject(error);
      },
    );
  });
}

export function clearMovieCache() {
  cache.clear();
  for (const entry of pending.values()) entry.controller.abort();
  pending.clear();
}
