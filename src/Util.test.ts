import * as Util from "./Util";
import { expect, test } from "vitest";

////////////////////////////////////////////////////////////////////////////////
// Util.makeID
////////////////////////////////////////////////////////////////////////////////

test("Util.makeID(3) to return a string of length 3", () => {
  expect(Util.makeID(3).length).toBe(3);
});

test("Util.makeID(0) to return a string of length 0", () => {
  expect(Util.makeID(0).length).toBe(0);
});

test("Util.makeID(32) to return only alpha numeric characters", () => {
  const validCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const id = Util.makeID(32);
  for (let i = 0; i < id.length; i++) {
    expect(validCharacters.includes(id.charAt(i))).toBeTruthy();
  }
});

////////////////////////////////////////////////////////////////////////////////
// Util.removeTrailingZeros
////////////////////////////////////////////////////////////////////////////////

test('Util.removeTrailingZeros("0") to return "', () => {
  expect(Util.removeTrailingZeros("0")).toBe("");
});

test('Util.removeTrailingZeros("000000") to return ""', () => {
  expect(Util.removeTrailingZeros("000000")).toBe("");
});

test('Util.removeTrailingZeros("0000001") to return the "0000001', () => {
  expect(Util.removeTrailingZeros("0000001")).toBe("0000001");
});

test('Util.removeTrailingZeros("0000100") to return the "00001', () => {
  expect(Util.removeTrailingZeros("0000100")).toBe("00001");
});

////////////////////////////////////////////////////////////////////////////////
// Util.addCommasEveryN
////////////////////////////////////////////////////////////////////////////////

test('Util.addCommasEveryN("", 3) to return the ""', () => {
  expect(Util.addCommasEveryN("", 3)).toBe("");
});

test('Util.addCommasEveryN("1", 3) to return the "1', () => {
  expect(Util.addCommasEveryN("1", 3)).toBe("1");
});

test('Util.addCommasEveryN("111", 3) to return the "111', () => {
  expect(Util.addCommasEveryN("111", 3)).toBe("111");
});

test('Util.addCommasEveryN("1111", 3) to return the "1,111', () => {
  expect(Util.addCommasEveryN("1111", 3)).toBe("1,111");
});

test('Util.addCommasEveryN("1111111", 3) to return the "1,111,111', () => {
  expect(Util.addCommasEveryN("1111111", 3)).toBe("1,111,111");
});
test('Util.addCommasEveryN("1111111", 1) to return the "1,1,1,1,1,1,1', () => {
  expect(Util.addCommasEveryN("1111111", 1)).toBe("1,1,1,1,1,1,1");
});

////////////////////////////////////////////////////////////////////////////////
// Util.displayUnit
////////////////////////////////////////////////////////////////////////////////

test('Util.displayUnit("", 0) to return the ["0", ""]', () => {
  expect(Util.displayUnit("", 0)).toStrictEqual(["0", ""]);
});

test('Util.displayUnit("100", 0) to return the ["100", ""]', () => {
  expect(Util.displayUnit("100", 0)).toStrictEqual(["100", ""]);
});

test('Util.displayUnit("", 3) to return the ["0", "000"]', () => {
  expect(Util.displayUnit("", 3)).toStrictEqual(["0", "000"]);
});

test('Util.displayUnit("1", 3) to return the ["0", "001"]', () => {
  expect(Util.displayUnit("1", 3)).toStrictEqual(["0", "001"]);
});

test('Util.displayUnit("111111", 3) to return the ["111", "111"]', () => {
  expect(Util.displayUnit("111111", 3)).toStrictEqual(["111", "111"]);
});

test('Util.displayUnit("111000", 4) to return the ["11", "1000"]', () => {
  expect(Util.displayUnit("111000", 4)).toStrictEqual(["11", "1000"]);
});

test('Util.displayUnit("111000", 3) to return the ["111", "000"]', () => {
  expect(Util.displayUnit("111000", 3)).toStrictEqual(["111", "000"]);
});
