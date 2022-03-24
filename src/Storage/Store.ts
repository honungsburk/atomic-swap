import { NetworkID } from "cardano-web-bridge-wrapper";
import Observable from "../Util/Behavior/Observable";
import * as MathUtil from "../Util/Math";

export type TransactionEntryV1 = {
  txHash: string;
  ttl: number;
  networkID: NetworkID;
  timestamp: number;
};

function isTransactionEntryV1(x: any): x is TransactionEntryV1 {
  return (
    typeof x.txHash === "string" &&
    typeof x.ttl === "number" &&
    typeof x.timestamp === "number"
  );
}

export type VolumeV1 = {
  volume: number;
  timestamp: number;
};

function isVolumeV1(x: any): x is VolumeV1 {
  return typeof x.volume === "number" && typeof x.timestamp === "number";
}

/**
 * Store handles the Sync & persistence of data across the app.
 * It also handles migrations between different version of the app
 *
 */
class Store {
  private observable: Observable<
    (txEntry: TransactionEntryV1 | undefined) => void
  >;
  private store: Storage;

  static singelton: Store | null = null;

  static create(): Store {
    if (Store.singelton === null) {
      Store.singelton = new Store();
    }
    return Store.singelton;
  }

  private constructor() {
    this.observable = new Observable();
    this.store = window.localStorage;
    const version = this.store.getItem("version");
    if (version !== "v1") {
      this.store.clear();
      this.store.setItem("version", "v1");
    }
  }

  setPendingTx(txHash: string, ttl: number, networkID: NetworkID): void {
    const txEntry: TransactionEntryV1 = {
      txHash: txHash,
      ttl: ttl,
      networkID: networkID,
      timestamp: new Date().getMilliseconds(),
    };
    this.store.setItem("pendingtx", JSON.stringify(txEntry));
    this.observable.forEachObserver((fn) => fn({ ...txEntry }));
  }

  deletePendingTx(): void {
    this.store.removeItem("pendingtx");
    this.observable.forEachObserver((fn) => fn(undefined));
  }

  getPendingTx(): TransactionEntryV1 | undefined {
    const key = "pendingtx";
    const txEntryS: string | null = this.store.getItem(key);
    if (txEntryS !== null) {
      const mtxEntry = JSON.parse(txEntryS);
      if (isTransactionEntryV1(mtxEntry)) {
        return mtxEntry;
      } else {
        this.store.removeItem(key);
      }
    }
    return undefined;
  }

  on(
    type: "TransactionEntry",
    fn: (txEntry: TransactionEntryV1 | undefined) => void
  ): () => void {
    return this.observable.addObserver(fn);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Volume
  ////////////////////////////////////////////////////////////////////////////////

  private volumeKey = "chatVolume";

  getVolume(): VolumeV1 | undefined {
    const volumeS: string | null = this.store.getItem(this.volumeKey);
    if (volumeS !== null) {
      const mtxEntry = JSON.parse(volumeS);
      if (isVolumeV1(mtxEntry)) {
        return mtxEntry;
      } else {
        this.store.removeItem(this.volumeKey);
      }
    }
    return undefined;
  }

  setVolume(volume: number): void {
    const txEntry: VolumeV1 = {
      volume: MathUtil.clamp(volume, 0, 100),
      timestamp: new Date().getMilliseconds(),
    };
    this.store.setItem(this.volumeKey, JSON.stringify(txEntry));
  }
}

export default Store;
