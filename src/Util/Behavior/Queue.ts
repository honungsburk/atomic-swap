class Queue<A> {
  private queue: A[];

  constructor() {
    this.queue = [];
  }

  /**
   * Empty the queue
   */
  empty(): void {
    this.queue = [];
  }

  /**
   * Add an element to the queue
   *
   * @param x the element to be added to the queue
   */
  add(x: A) {
    this.queue.push(x);
  }

  /**
   * Will iterate over all elements in the queue in the order they where added.
   * Anything processed will be removed from the queue.
   *
   * @param fn what to do on each element
   */
  flush(fn: (x: A) => void) {
    this.queue.forEach(fn);
    this.queue = [];
  }
}

export default Queue;
