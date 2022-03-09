import { Buffer } from "buffer";

/**
 *
 * @param s the string to add ellipses to
 * @param takeFront  the number of characters to take from the start
 * @param takeBack the number of characters to take from the end
 * @returns the string but with ellipses
 */
export function ellipsis(
  s: string,
  takeFront: number,
  takeBack: number
): string {
  if (s.length > takeFront + takeBack + 3) {
    const front = s.slice(0, takeFront);
    const back = takeBack > 0 ? s.slice(-takeBack) : "";
    return front + "..." + back;
  } else {
    return s;
  }
}

/**
 *
 * @param s the string to check
 * @returns whether or not the string is a valid hexadecimal number
 */
export function isHex(s: string) {
  const re = /^[0-9A-Fa-f]+$/;
  return re.test(s);
}

/**
 * @param str the string to check
 * @returns weather or not the string only contains alpha-numeric characters
 */
export function isAlphaNumeric(str: string): boolean {
  let code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)
    ) {
      // lower alpha (a-z)
      return false;
    }
  }
  return true;
}

/**
 *
 * @param {string} s
 * @returns string
 */
export function hexEncode(s: string): string {
  return Buffer.from(s).toString("hex");
}

/**
 *
 * @param {string} s
 * @returns Decoded as a string
 */
export function hexDecode(s: string): string {
  return Buffer.from(s, "hex").toString();
}

/**
 *
 * @param {UInt8Array} s
 * @returns Decoded as a string
 */
export function toHex(s: Uint8Array): string {
  return Buffer.from(s).toString("hex");
}

/**
 *
 * @param {string} s
 * @returns Decoded as a Uint8Array
 */
export function fromHex(s: string): Uint8Array {
  return Uint8Array.from(Buffer.from(s, "hex"));
}
