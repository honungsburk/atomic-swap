/**
 *
 * @param n the number of bytes
 * @returns the number of words needed to store all does bytes
 */
export function roundupBytesToWords(n: number): number {
  return quot(n + 7, 8);
}

/**
 * Performs integer division (normal division but rounded down)
 *
 * @param a the quotient
 * @param b the divisor
 * @returns
 */
export function quot(a: number, b: number): number {
  return Math.floor(a / b);
}

/**
 * Performs integer division (normal division but rounded down)
 *
 * @param x the value to be clamped
 * @param min the minimum value
 * @param max the maximum value
 * @returns a value between min and max
 */
export function clamp(x: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, x));
}
