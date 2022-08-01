import * as Extra from "./Extra";
import { expect, test } from "vitest";

////////////////////////////////////////////////////////////////////////////////
// Extra.toHex & Extra.fromHex
////////////////////////////////////////////////////////////////////////////////

test('Extra.toHex(Extra.fromHex("1735ab27da") return "1735ab27da"', () => {
  expect(Extra.toHex(Extra.fromHex("1735ab27da"))).toBe("1735ab27da");
});

////////////////////////////////////////////////////////////////////////////////
// Extra.hexEncode & Extra.hexDecode
////////////////////////////////////////////////////////////////////////////////

test('Extra.hexEncode(Extra.hexDecode("Daddy") return "Daddy"', () => {
  expect(Extra.hexDecode(Extra.hexEncode("Daddy"))).toBe("Daddy");
});

test('Extra.hexEncode(Extra.hexDecode("Mommy") return "Mommy"', () => {
  expect(Extra.hexDecode(Extra.hexEncode("Mommy"))).toBe("Mommy");
});

////////////////////////////////////////////////////////////////////////////////
// Extra.ellipsis
////////////////////////////////////////////////////////////////////////////////

test('Extra.ellipsis("123456789", 3, 3)', () => {
  // if the number of characters isn't reduced there wil be no ellipsis
  expect(Extra.ellipsis("123456789", 3, 3)).toBe("123456789");
});

test('Extra.ellipsis("123456789", 2, 2)', () => {
  // if the number of characters isn't reduced there wil be no ellipsis
  expect(Extra.ellipsis("123456789", 2, 2)).toBe("12...89");
});

test('Extra.ellipsis("123456789", 0, 2)', () => {
  // if the number of characters isn't reduced there wil be no ellipsis
  expect(Extra.ellipsis("123456789", 0, 2)).toBe("...89");
});

test('Extra.ellipsis("123456789", 2, 0)', () => {
  // if the number of characters isn't reduced there wil be no ellipsis
  expect(Extra.ellipsis("123456789", 2, 0)).toBe("12...");
});

test('Extra.ellipsis("123456789", 0, 0)', () => {
  // if the number of characters isn't reduced there wil be no ellipsis
  expect(Extra.ellipsis("123456789", 0, 0)).toBe("...");
});

////////////////////////////////////////////////////////////////////////////////
// Extra.isHex
////////////////////////////////////////////////////////////////////////////////

test('Extra.isHex("aabbccddeeff")', () => {
  expect(Extra.isHex("abcdef")).toBeTruthy();
});

test("Extra.isHex entire string must be a valid hexadecimal number", () => {
  expect(Extra.isHex("abcdef ")).toBeFalsy();
});

test("Extra.isHex entire string must be a valid hexadecimal number", () => {
  expect(Extra.isHex(" abcdef")).toBeFalsy();
});

test("Extra.isHex entire string must be a valid hexadecimal number", () => {
  expect(Extra.isHex("aabbcc ddeeff")).toBeFalsy();
});

test('Extra.isHex entire string does not validate "g"', () => {
  expect(Extra.isHex("g")).toBeFalsy();
});

test("Extra.isHex can handle all hexadecimal values", () => {
  expect(Extra.isHex("1234567890abcdef")).toBeTruthy();
});

test("Extra.isHex can handle captialization", () => {
  expect(Extra.isHex("ABCDEF")).toBeTruthy();
});
