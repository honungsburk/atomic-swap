import create from "zustand";
import { BasicWallet } from "cardano-web-bridge-wrapper/lib/BasicWallet";
import * as CIP30 from "cardano-web-bridge-wrapper/lib/CIP30";

export namespace Wallet {
  /**
   *
   * @returns a list of all injected cardano wallets
   */
  export function injectedAPIs(): CIP30.InitalAPI<any>[] {
    const walletChoices: CIP30.InitalAPI<any>[] = [];

    for (const property in window.cardano) {
      const api: any = window.cardano[property];
      if (CIP30.isInitalAPI(api)) {
        walletChoices.push(api);
      }
    }

    return walletChoices;
  }

  export const use = create((set) => ({
    wallet: undefined as undefined | BasicWallet,
    connect: (wallet: BasicWallet) => set({ wallet: wallet }),
  }));
}
