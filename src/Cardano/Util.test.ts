import * as Util from "./Util";
import { expect, test } from "vitest";
////////////////////////////////////////////////////////////////////////////////
// Util.assetIdentifierType
////////////////////////////////////////////////////////////////////////////////

test('Util.assetIdentifierType("ABCDEF") === "unknown"', () => {
  expect(Util.assetIdentifierType("ABCDEF")).toBe("unknown");
});

test('Util.assetIdentifierType("asset15j9y86mwqlutxs6z2hm8avhzgc66d8f0an626a") === "assetID"', () => {
  expect(
    Util.assetIdentifierType("asset15j9y86mwqlutxs6z2hm8avhzgc66d8f0an626a")
  ).toBe("assetID");
});

test('Util.assetIdentifierType("asset15j9y86mwqlutxs6z2hm8avhzgc66d8f0an626") === "unknown"', () => {
  expect(
    Util.assetIdentifierType("asset15j9y86mwqlutxs6z2hm8avhzgc66d8f0an626")
  ).toBe("unknown");
});

test('Util.assetIdentifierType("01020ffde35017fd8e196b3e43cf6a1e669d5a0db1dbb0d955605c09") === "policyID"', () => {
  expect(
    Util.assetIdentifierType(
      "01020ffde35017fd8e196b3e43cf6a1e669d5a0db1dbb0d955605c09"
    )
  ).toBe("policyID");
});

test('Util.assetIdentifierType("01020ffde35017fd8e196b3e43cf6a1e669d5a0db1dbb0d955605c0") === "unknown"', () => {
  expect(
    Util.assetIdentifierType(
      "01020ffde35017fd8e196b3e43cf6a1e669d5a0db1dbb0d955605c0"
    )
  ).toBe("unknown");
});
