import * as ListExtra from "./ListExtra";

////////////////////////////////////////////////////////////////////////////////
// ListExtra.any()
////////////////////////////////////////////////////////////////////////////////

test("ListExtra.any([],  () => false) === false", () => {
  const xs: number[] = [];
  expect(ListExtra.any(xs, () => false)).toBeFalsy();
});

test("ListExtra.any([1],  () => false) === false", () => {
  const xs: number[] = [1];
  expect(ListExtra.any(xs, () => false)).toBeFalsy();
});

test("ListExtra.any([1,2,3,4],  (n) => n > 0) === true", () => {
  const xs: number[] = [1, 2, 3, 4];
  expect(ListExtra.any(xs, (n) => n > 0)).toBeTruthy();
});

test("ListExtra.any([1,2,3,4],  (n) => n > 0) === true", () => {
  const xs: number[] = [-1, -2, 3, 4];
  expect(ListExtra.any(xs, (n) => n > 0)).toBeTruthy();
});

test("ListExtra.any([-1,-2,-3,-4],  (n) => n > 0) === false", () => {
  const xs: number[] = [-1, -2, -3, -4];
  expect(ListExtra.any(xs, (n) => n > 0)).toBeFalsy();
});

////////////////////////////////////////////////////////////////////////////////
// ListExtra.eq()
////////////////////////////////////////////////////////////////////////////////

test("ListExtra.eq([], []) === true", () => {
  const s1: number[] = [];
  const s2: number[] = [];
  expect(ListExtra.eq(s1, s2)).toBeTruthy();
});

test("ListExtra.eq([], []) === true", () => {
  const s1 = [1, 2, 3];
  const s2 = [1, 2, 3];
  expect(ListExtra.eq(s1, s2)).toBeTruthy();
});

test("ListExtra.eq([], []) === false", () => {
  const s1 = [1, 3];
  const s2 = [1, 2, 3];
  expect(ListExtra.eq(s1, s2)).toBeFalsy();
});
