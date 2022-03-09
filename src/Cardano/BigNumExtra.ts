import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";

/**
 *
 * @param num The number to compare with
 * @param min the lower bound
 * @param max the upper bound
 * @returns a number between min and max
 */
export function clamp(num: BigNum, min: BigNum, max: BigNum): BigNum {
  return num.compare(min) < 0 ? min : num.compare(max) < 0 ? num : max;
}

/**
 *
 * @param left left hand side
 * @param right right hand side
 * @returns whether or not the two BigNums are equal
 */
export function eq(left: BigNum, right: BigNum): boolean {
  return left.compare(right) === 0;
}

/**
 *
 * @param n the bignum
 * @returns the number
 */
export function bigNumtoNumber(n: BigNum): number {
  return parseInt(n.to_str());
}

/**
 * Integer division for BigNum
 *
 * Warning: increadibly slow
 *
 * @param n
 * @param x
 * @returns
 */
export const divideBy =
  (lib: typeof CardanoSerializationLib) => (n: BigNum, x: BigNum) => {
    const n_num = parseInt(n.to_str());
    const x_num = parseInt(x.to_str());

    const result = Math.floor(n_num / x_num);

    return lib.BigNum.from_str(result.toString());
  };
