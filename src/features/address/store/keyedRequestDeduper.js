export const createKeyedRequestDeduper = () => {
  const inFlight = new Map();

  const run = (key, factory) => {
    const normalizedKey = String(key ?? '');
    if (inFlight.has(normalizedKey)) return inFlight.get(normalizedKey);

    const promise = Promise.resolve()
      .then(factory)
      .finally(() => {
        if (inFlight.get(normalizedKey) === promise) inFlight.delete(normalizedKey);
      });

    inFlight.set(normalizedKey, promise);
    return promise;
  };

  return {
    run,
    has: (key) => inFlight.has(String(key ?? '')),
    size: () => inFlight.size,
  };
};
