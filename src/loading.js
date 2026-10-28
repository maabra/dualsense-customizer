// Transfer sizes may be compressed, rounded, or absent. Reserve 100% for readiness.
export function transferProgress(loaded, total, previous = 0) {
  if (!Number.isFinite(loaded) || !Number.isFinite(total) || total <= 0) return null;
  return Math.max(previous, Math.min(99, Math.max(0, Math.floor(loaded / total * 100))));
}
