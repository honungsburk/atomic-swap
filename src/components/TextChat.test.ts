import * as TextChat from "./TextChat";
import { expect, test } from "vitest";

////////////////////////////////////////////////////////////////////////////////
// nbrLines
////////////////////////////////////////////////////////////////////////////////

test("TextChat.nbrLines - empty string", () => {
  const testString = "";
  const result = TextChat.nbrLinesToShow(testString, 200, (s) => s.length * 20);
  expect(result).toBe(1);
});

test("TextChat.nbrLines - simple one line", () => {
  const testString = "hello";
  const result = TextChat.nbrLinesToShow(testString, 200, (s) => s.length * 20);
  expect(result).toBe(1);
});

test("TextChat.nbrLines - simple two line", () => {
  const testString = "hellohellohello";
  const result = TextChat.nbrLinesToShow(testString, 200, (s) => s.length * 20);
  expect(result).toBe(2);
});

test("TextChat.nbrLines - newlines", () => {
  const testString = "\n\n\n";
  const result = TextChat.nbrLinesToShow(testString, 200, (s) => s.length * 20);
  expect(result).toBe(4);
});

test("TextChat.nbrLines - newlines", () => {
  const testString = "as\nas\nas\n";
  const result = TextChat.nbrLinesToShow(testString, 200, (s) => s.length * 20);
  expect(result).toBe(4);
});
