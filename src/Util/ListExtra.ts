/**
 * Will check that a certain condidtion is meet at least once across all the
 * elements of the list.
 *
 * @param list the list to check the condition for
 * @param fn the condition which must be fullfilled at least once
 * @returns
 */
export function any<A>(list: A[], fn: (v: A) => boolean): boolean {
  for (let i = 0; i < list.length; i++) {
    const res = fn(list[i]);
    if (res) {
      return true;
    }
  }
  return false;
}

/**
 * Will check that each item is equal using (===).
 * Note that this will not work on different objects
 *
 * @param a a list to check for equality
 * @param b a list to check for equality
 * @returns wheather or not the two lists are equal
 */
export function eq<A>(a: A[], b: A[]): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 *
 * @param as the first list of values
 * @param bs the second list of values
 * @param eq the equality operator
 * @returns whether or not there is an intersection
 */
export const hasIntersection =
  <A>(eq: (a: A, b: A) => boolean) =>
  (as: A[], bs: A[]): boolean => {
    for (const a of as) {
      for (const b of bs) {
        if (eq(a, b)) {
          return true;
        }
      }
    }
    return false;
  };
