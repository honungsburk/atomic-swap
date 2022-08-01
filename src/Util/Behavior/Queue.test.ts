import Queue from "./Queue";
import { expect, test } from "vitest";

test("Queue - can add an element and flush it", () => {
  const obs = new Queue<number>();
  obs.add(1);

  let allValid = true;
  obs.flush((n) => {
    allValid = n === 1 && allValid;
  });

  expect(allValid).toBeTruthy();
});

test("Queue - flushing twice will have the second function not called at all", () => {
  const obs = new Queue<number>();
  obs.add(1);
  obs.add(2);
  obs.add(3);
  obs.add(4);

  obs.flush(() => {
    return true;
  });
  let queueIsEmpty = true;
  obs.flush(() => (queueIsEmpty = false));

  expect(queueIsEmpty).toBeTruthy();
});

test("Queue - if you call empty() there will be nothing to flush()", () => {
  const obs = new Queue<number>();
  obs.add(1);
  obs.add(2);
  obs.add(3);
  obs.add(4);

  obs.empty();
  let queueIsEmpty = true;
  obs.flush(() => (queueIsEmpty = false));

  expect(queueIsEmpty).toBeTruthy();
});
