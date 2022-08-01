import * as BigNumExtra from "./BigNumExtra";
import { BigNum } from "@emurgo/cardano-serialization-lib-nodejs";
import * as Cardano from "@emurgo/cardano-serialization-lib-nodejs";
import { expect, test } from "vitest";

////////////////////////////////////////////////////////////////////////////////
// BigNumExtra.eq
////////////////////////////////////////////////////////////////////////////////

test('0 === 0"', () => {
  const s1 = BigNum.zero();
  const s2 = BigNum.zero();
  expect(BigNumExtra.eq(s1, s2)).toBeTruthy();
});

test('0 !== 1"', () => {
  const s1 = BigNum.zero();
  const s2 = BigNum.from_str("1");
  expect(BigNumExtra.eq(s1, s2)).toBeFalsy();
});

test('123 === 123"', () => {
  const s1 = BigNum.from_str("123");
  const s2 = BigNum.from_str("123");
  expect(BigNumExtra.eq(s1, s2)).toBeTruthy();
});

////////////////////////////////////////////////////////////////////////////////
// BigNumExtra.divideBy(x, n)
////////////////////////////////////////////////////////////////////////////////

test('BigNumExtra.divideBy(100,2) === 50"', () => {
  const s1 = BigNum.from_str("100");
  const s2 = BigNum.from_str("2");
  expect(BigNumExtra.divideBy(Cardano)(s1, s2).to_str()).toEqual("50");
});

test('BigNumExtra.divideBy(101,2) === 50"', () => {
  const s1 = BigNum.from_str("101");
  const s2 = BigNum.from_str("2");
  expect(BigNumExtra.divideBy(Cardano)(s1, s2).to_str()).toEqual("50");
});

test('BigNumExtra.divideBy(4,2) === 2"', () => {
  const s1 = BigNum.from_str("4");
  const s2 = BigNum.from_str("2");
  expect(BigNumExtra.divideBy(Cardano)(s1, s2).to_str()).toEqual("2");
});

test('BigNumExtra.divideBy(0,10) === 0"', () => {
  const s1 = BigNum.from_str("0");
  const s2 = BigNum.from_str("10");
  expect(BigNumExtra.divideBy(Cardano)(s1, s2).to_str()).toEqual("0");
});

test('BigNumExtra.divideBy(112782,2) === 0"', () => {
  const s1 = BigNum.from_str("112782");
  const s2 = BigNum.from_str("2");
  expect(BigNumExtra.divideBy(Cardano)(s1, s2).to_str()).toEqual("56391");
});
