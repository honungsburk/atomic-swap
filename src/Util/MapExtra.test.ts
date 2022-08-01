import * as MapExtra from "./MapExtra";
import { expect, test } from "vitest";

////////////////////////////////////////////////////////////////////////////////
// MapExtra.eq()
////////////////////////////////////////////////////////////////////////////////

test("MapExtra.eq([], []) === true", () => {
  const s1 = new Map<string, string>([]);
  const s2 = new Map<string, string>([]);
  expect(MapExtra.eq(s1, s2)).toBeTruthy();
});

test("Two identical maps", () => {
  const s1 = new Map<string, string>([
    ["k1", "v1"],
    ["k2", "v2"],
    ["k3", "v3"],
  ]);
  const s2 = new Map<string, string>([
    ["k1", "v1"],
    ["k3", "v3"],
    ["k2", "v2"],
  ]);
  expect(MapExtra.eq(s1, s2)).toBeTruthy();
});

test("Different maps should give false", () => {
  const s1 = new Map<string, string>([
    ["k1", "v1"],
    ["k2", "v2"],
    ["k3", "v3"],
  ]);
  const s2 = new Map<string, string>([
    ["k1", "v1"],
    ["k2", "v2"],
  ]);
  expect(MapExtra.eq(s1, s2)).toBeFalsy();
});

test("Double entries should not matter", () => {
  const s1 = new Map<string, string>([
    ["k1", "v1"],
    ["k2", "v2"],
    ["k2", "v2"],
  ]);
  const s2 = new Map<string, string>([
    ["k1", "v1"],
    ["k3", "v3"],
    ["k2", "v2"],
  ]);
  expect(MapExtra.eq(s1, s2)).toBeFalsy();
});
