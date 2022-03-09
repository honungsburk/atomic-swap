/**
 * Check that two sets contain the same elements. (uses .has(e) under the hood)
 *
 * @param left set
 * @param right set
 * @returns wheather or not the two sets are equal.
 */
export function eq<T>(left: Set<T>, right: Set<T>): boolean {
  let isMatching = left.size === right.size;

  if (!isMatching) {
    return isMatching;
  }

  left.forEach((e) => {
    isMatching = right.has(e);
  });

  return isMatching;
}
