import * as SetExtra from "./SetExtra";
import { expect, test } from "vitest";
////////////////////////////////////////////////////////////////////////////////
// SetExtra.eq()
////////////////////////////////////////////////////////////////////////////////

test("SetExtra.eq([], []) === true", () => {
  const s1 = new Set<number>([]);
  const s2 = new Set<number>([]);
  expect(SetExtra.eq(s1, s2)).toBeTruthy();
});

test("SetExtra.eq([1,2,3], [1,3,2]) === true", () => {
  const s1 = new Set<number>([1, 2, 3]);
  const s2 = new Set<number>([1, 3, 2]);
  expect(SetExtra.eq(s1, s2)).toBeTruthy();
});

test("SetExtra.eq([1,2], [1,3,2]) === false", () => {
  const s1 = new Set<number>([1, 2]);
  const s2 = new Set<number>([1, 3, 2]);
  expect(SetExtra.eq(s1, s2)).toBeFalsy();
});

test("SetExtra.eq([1,2, 2], [1,3,2]) === false", () => {
  const s1 = new Set<number>([1, 2, 2]);
  const s2 = new Set<number>([1, 3, 2]);
  expect(SetExtra.eq(s1, s2)).toBeFalsy();
});
