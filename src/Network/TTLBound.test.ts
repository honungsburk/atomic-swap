import * as TTLBound from "./TTLBound";
import { expect, test } from "vitest";

test("TTLBound.maxTTL - find the max bound", () => {
  const bound1 = TTLBound.initTTL();
  const bound2 = TTLBound.initTTL();
  bound1.high = 100;
  bound1.low = 10;
  bound2.high = 90;
  bound2.low = 80;
  expect(TTLBound.maxTTL(bound1, bound2)).toBe(90);
});

test("TTLBound.maxTTL - find edge", () => {
  const bound1 = TTLBound.initTTL();
  const bound2 = TTLBound.initTTL();
  bound1.high = 100;
  bound1.low = 10;
  bound2.high = 120;
  bound2.low = 100;
  expect(TTLBound.maxTTL(bound1, bound2)).toBe(100);
});

test("TTLBound.maxTTL - find the max bound", () => {
  const bound1 = TTLBound.initTTL();
  const bound2 = TTLBound.initTTL();
  bound1.high = 100;
  bound1.low = 10;
  bound2.high = 120;
  bound2.low = 101;
  expect(() => TTLBound.maxTTL(bound1, bound2)).toThrow();
});
