const inFlightReads = new Map();

export function dedupeRepairRead(key, work) {
  const normalizedKey = String(key || '').trim();
  if (!normalizedKey) return Promise.resolve().then(work);

  const existing = inFlightReads.get(normalizedKey);
  if (existing) return existing;

  const pending = Promise.resolve()
    .then(work)
    .finally(() => {
      if (inFlightReads.get(normalizedKey) === pending) {
        inFlightReads.delete(normalizedKey);
      }
    });

  inFlightReads.set(normalizedKey, pending);
  return pending;
}

export function clearRepairReadDedupe() {
  inFlightReads.clear();
}
