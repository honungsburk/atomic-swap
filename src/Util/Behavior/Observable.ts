type HasID<T> = { id: number; observer: T };

class Observable<T> {
  private observers: HasID<T>[];
  private idCounter: number;

  constructor() {
    this.observers = [];
    this.idCounter = 0;
  }

  addObserver(observer: T): () => void {
    this.idCounter = this.idCounter + 1;
    const localID = this.idCounter;
    this.observers.push({ id: localID, observer: observer });
    return () => {
      this.observers = this.observers.filter((l) => l.id !== localID);
    };
  }

  deleteAllObservers(): void {
    this.observers = [];
  }

  forEachObserver(fn: (observer: T) => void): void {
    this.observers.forEach((o) => fn(o.observer));
  }
}

export default Observable;
