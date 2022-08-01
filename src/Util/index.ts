export * as Extra from "./Extra";
export * as List from "./ListExtra";
export * as Map from "./MapExtra";
export * as Set from "./SetExtra";
export * as Math from "./MapExtra";
export * as Result from "./Result";

/**
 *
 * @param length the length
 * @returns a random string of a given length
 */
export function makeID(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Removes trailing zeros
 *
 * @param str the string
 * @returns
 */
export function removeTrailingZeros(str: string): string {
  return str[str.length - 1] === "0"
    ? removeTrailingZeros(str.slice(0, -1))
    : str;
}

/**
 *
 * @param str the string to add commas to
 * @param n how often to add commas
 * @param memory internal emory
 * @returns a formated string
 */
export function addCommasEveryN(str: string, n = 3, memory = 1): string {
  if (str.length > 1) {
    if (memory === n) {
      return addCommasEveryN(str.slice(0, -1), n, 1) + "," + str.slice(-1);
    } else {
      return addCommasEveryN(str.slice(0, -1), n, memory + 1) + str.slice(-1);
    }
  } else {
    return str;
  }
}

/**
 *
 * @param quantity the value as a string with no decimals
 * @param decimals the number of decimals it should have
 * @returns the number and the fraction
 */
export function displayUnit(quantity: string, decimals = 6): [string, string] {
  const aboveDecimal = quantity.length - decimals;
  const num = aboveDecimal > 0 ? quantity.slice(0, aboveDecimal) : "0";
  let subNum = quantity.slice(-1 * decimals).padStart(decimals, "0");

  if (decimals === 0) {
    subNum = "";
  }

  return [num, subNum];
}
