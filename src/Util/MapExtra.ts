/**
 *
 * @param left map
 * @param right map
 * @returns wheather or not the two maps contain the same keys and values
 */
export function eq<K, V>(left: Map<K, V>, right: Map<K, V>): boolean {
  let isMatching = left.size === right.size;

  if (!isMatching) {
    return isMatching;
  }

  left.forEach((value, key) => {
    const v = right.get(key);
    isMatching = v === value;
  });

  return isMatching;
}

/**
 *
 * @param m the map to copy
 * @returns a shallow copy of the map
 */
export function shallowCopy<K, V>(m: Map<K, V>): Map<K, V> {
  const copy = new Map<K, V>();
  m.forEach((val, key) => {
    copy.set(key, val);
  });
  return copy;
}
