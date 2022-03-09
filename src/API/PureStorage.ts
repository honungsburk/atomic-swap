/**
 * A pure implementation of the Storage API. Usefull for testing.
 */
export default class PureStorage implements Storage {
  private store: Map<string, string>;

  constructor() {
    this.store = new Map();
  }

  get length() {
    return this.store.size;
  }

  clear(): void {
    this.store = new Map();
  }
  getItem(key: string): string | null {
    const res = this.store.get(key);
    return res === undefined ? null : res;
  }

  key(index: number): string | null {
    if (index >= 0 && index < this.length) {
      let i = 0;
      for (const key in this.store.keys()) {
        if (i === index) {
          return key;
        }
        i++;
      }
    }
    return null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}
