import * as MathUtil from "./Math";
import { expect, test } from "vitest";

////////////////////////////////////////////////////////////////////////////////
// MathUtil.quot(a, b)
////////////////////////////////////////////////////////////////////////////////

test("quot(11, 5) === 2", () => {
  expect(MathUtil.quot(11, 5)).toEqual(2);
});

test("quot(10, 5) === 2", () => {
  expect(MathUtil.quot(10, 5)).toEqual(2);
});

test("quot(11, 1) === 11", () => {
  expect(MathUtil.quot(11, 1)).toEqual(11);
});

////////////////////////////////////////////////////////////////////////////////
// MathUtil.roundupBytesToWords(a)
////////////////////////////////////////////////////////////////////////////////

test("MathUtil.roundupBytesToWords(8) === 1", () => {
  expect(MathUtil.roundupBytesToWords(8)).toEqual(1);
});

test("MathUtil.roundupBytesToWords(1) === 1", () => {
  expect(MathUtil.roundupBytesToWords(8)).toEqual(1);
});

test("MathUtil.roundupBytesToWords(123) === 16", () => {
  expect(MathUtil.roundupBytesToWords(123)).toEqual(16);
});

test("MathUtil.roundupBytesToWords(0) === 1", () => {
  expect(MathUtil.roundupBytesToWords(0)).toEqual(0);
});

////////////////////////////////////////////////////////////////////////////////
// MathUtil.clamp
////////////////////////////////////////////////////////////////////////////////

test("MathUtil.clamp(50, 1, 100) === 50", () => {
  expect(MathUtil.clamp(50, 1, 100)).toEqual(50);
});

test("MathUtil.clamp(0, 1, 100) === 50", () => {
  expect(MathUtil.clamp(0, 1, 100)).toEqual(1);
});

test("MathUtil.clamp(0, -11, 100) === 50", () => {
  expect(MathUtil.clamp(0, -11, 100)).toEqual(0);
});

test("MathUtil.clamp(101, -11, 100) === 50", () => {
  expect(MathUtil.clamp(101, -11, 100)).toEqual(100);
});
