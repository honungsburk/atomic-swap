import create from "zustand";
import { BasicWallet } from "cardano-web-bridge-wrapper/lib/BasicWallet";
import * as CIP30 from "cardano-web-bridge-wrapper/lib/CIP30";
import * as Channel from "src/Network/Channel";
import * as ChannelPeerJS from "src/Network/ChannelPeerJS";
import * as P2PSession from "src/Network/Session";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";
import * as TxBuilder from "src/Cardano/TxBuilder";
import { persist } from "zustand/middleware";
import * as Util from "src/Util";
import * as CWBW from "cardano-web-bridge-wrapper";
import BlockFrostAPI from "./API/BlockFrost/BlockFrostAPI";
import * as BlockFrostTypes from "./API/BlockFrost/Types";

// Wallet
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

  type State = {
    wallet: undefined | BasicWallet;
    inject: (wallet: BasicWallet) => void;
    deject: () => void;
  };

  export const use = create<State>((set) => ({
    wallet: undefined,
    inject: (wallet: BasicWallet) => set({ wallet: wallet }),
    deject: () => set({ wallet: undefined }),
  }));
}

// NetworkID
export namespace NetworkID {
  type State = {
    networkID?: CWBW.NetworkID;
  };

  export const use = create<State>((set) => ({
    networkID: undefined,
    set: (networkID?: CWBW.NetworkID) => set({ networkID: networkID }),
  }));

  Wallet.use.subscribe(async (state) => {
    if (state.wallet) {
      const networkID = await state.wallet.getNetworkId();
      use.setState({ networkID: networkID });
    } else {
      use.setState({ networkID: undefined });
    }
  });
}

// ChannelState
export namespace ChannelState {
  type State = {
    channelState: Channel.ChannelState;
    set: (state: Channel.ChannelState) => void;
  };

  export const use = create<State>((set) => ({
    channelState: "Initalized",
    set: (state) => set({ channelState: state }),
  }));
}

// Session
export namespace Session {
  type State = {
    session: P2PSession.Session;
  };

  function newSession(): P2PSession.Session {
    //Create
    const newChannel = new ChannelPeerJS.ChannelPeerJS<any>();
    const session = new P2PSession.Session(newChannel, CardanoSerializationLib);

    //Listeners
    ChannelState.use.setState({ channelState: session.getChannelState() });
    session.onChannelState((s) => {
      ChannelState.use.setState({ channelState: s });
    });

    //return
    return session;
  }

  export const use = create<State>((set, get) => {
    return {
      session: newSession(),
      newSession: () => {
        get().session.destroy();
        set({ session: newSession() });
      },
    };
  });

  Wallet.use.subscribe(async (state) => {
    if (state.wallet) {
      const session = use.getState().session;
      const networkID = await state.wallet.getNetworkId();
      session.updateMyNetworkID(networkID);

      const myAddress = await state.wallet.getChangeAddress();
      session.updateMyAddress(myAddress.to_address());

      const utxos = await state.wallet.getUtxos();
      session.updateMyUTxOs(utxos);

      const ttlBound = await TxBuilder.createTTLBound(networkID);
      session.updateMyTTLBound(ttlBound);
    }
  });
}

/**
 * Volume is a number in the range [0, 100]
 */
export namespace Volume {
  type State = {
    volume: number;
    set: (volume: number) => void;
  };

  export const use = create(
    persist<State>(
      (set) => ({
        volume: 50,
        set: (volume: number) =>
          set({ volume: Util.Math.clamp(volume, 0, 100) }),
      }),
      {
        name: "zus-volume", // unique name
        getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      }
    )
  );
}

// Pending Transaction

export namespace PendingTransaction {
  type TX = {
    txHash: string;
    ttl: number;
    networkID: CWBW.NetworkID;
  };

  type State = {
    pendingTransactions: TX[];
    add: (tx: TX) => void;
    resolve: () => Promise<void>;
  };

  export const use = create(
    persist<State>(
      (set, get) => ({
        pendingTransactions: [],
        add: (pendingTx: TX) => {
          set({
            pendingTransactions: [pendingTx, ...get().pendingTransactions],
          });
        },

        // Remove all transactions that we know can no longer interfere.
        resolve: async () => {
          const notResolved = [];
          for (const pendingTx of get().pendingTransactions) {
            const API = new BlockFrostAPI(pendingTx.networkID);
            const result = await API.txs(pendingTx.txHash);
            // If we can't find it we can not remove it.
            if (!BlockFrostTypes.isTransaction(result)) {
              notResolved.push(pendingTx);
            } else {
              const latestBlock = await API.blocksLatest();
              if (
                !(
                  BlockFrostTypes.isBlock(latestBlock) &&
                  latestBlock.slot > pendingTx.ttl
                )
              ) {
                notResolved.push(pendingTx);
              }
            }
          }

          set({ pendingTransactions: notResolved });
        },
      }),
      {
        name: "zus-volume", // unique name
        getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      }
    )
  );

  //Check the pending transactions every 30 seconds
  use.getState().resolve();
  let intervalID: NodeJS.Timer | undefined = undefined;
  use.subscribe((s) => {
    const hasLength = s.pendingTransactions.length > 0;
    if (intervalID && !hasLength) {
      clearInterval(intervalID);
    }

    if (intervalID === undefined && hasLength) {
      intervalID = setInterval(() => {
        s.resolve();
      }, 30000);
    }
  });
}
