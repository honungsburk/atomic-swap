import { Ok, Err, Result } from "ts-results";

export type TTLBound = { low: number; high: number };

export function initTTL(): TTLBound {
  return { low: 0, high: 0 };
}

export function copy(ttlBound: TTLBound): TTLBound {
  return { low: ttlBound.low, high: ttlBound.high };
}

export function maxTTL(
  x: TTLBound,
  y: TTLBound
): Result<number, { title: "Out of bounds"; details: string }> {
  if (x.high >= y.low && y.high >= x.low) {
    return Ok(Math.min(x.high, y.high));
  }
  return Err({
    title: "Out of bounds",
    details: `No overlap between [${x.low}, ${x.high}] and [${y.low}, ${y.high}]`,
  });
}
