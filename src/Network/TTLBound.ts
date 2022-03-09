export type TTLBound = { low: number; high: number };

export function initTTL(): TTLBound {
  return { low: 0, high: 0 };
}

export function copy(ttlBound: TTLBound): TTLBound {
  return { low: ttlBound.low, high: ttlBound.high };
}

export function maxTTL(x: TTLBound, y: TTLBound): number {
  if (x.high >= y.low && y.high >= x.low) {
    return Math.min(x.high, y.high);
  }
  throw Error("TTL out of bounds");
}
