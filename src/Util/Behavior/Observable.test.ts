import Observable from "./Observable";
import { expect, test } from "vitest";

test("Observable - can add an observable value", () => {
  const obs = new Observable<number>();
  obs.addObserver(1);

  let allValid = true;
  obs.forEachObserver((n) => {
    allValid = n === 1;
  });
  expect(allValid).toBeTruthy();
});

test("Observable - can delete an observable value", () => {
  const obs = new Observable<number>();
  obs.addObserver(1);
  obs.addObserver(2);
  obs.addObserver(3);
  obs.addObserver(4);
  obs.deleteAllObservers();
  let allValid = true;
  obs.forEachObserver(() => {
    allValid = false;
  });
  expect(allValid).toBeTruthy();
});

test("Observable - can add same value and then only delete the exact one I want to delete", () => {
  const obs = new Observable<number>();
  const delete1 = obs.addObserver(1);
  const delete2 = obs.addObserver(2);
  obs.addObserver(3);
  obs.addObserver(4);
  delete1();
  delete2();
  let allValid = true;
  obs.forEachObserver((n) => {
    allValid = n > 2;
  });
  expect(allValid).toBeTruthy();
});
